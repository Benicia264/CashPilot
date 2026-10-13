-- =========================================================
-- CashPilot : schéma PostgreSQL (version à jour)
-- =========================================================

-- Entreprises
CREATE TABLE entreprises (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(150) NOT NULL,
  devise      VARCHAR(5) NOT NULL DEFAULT 'XAF',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Utilisateurs (rattachés à une entreprise)
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  entreprise_id     INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  nom               VARCHAR(150) NOT NULL,
  email             VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role              VARCHAR(15) NOT NULL DEFAULT 'gestionnaire'
                    CHECK (role IN ('proprietaire','gestionnaire','lecteur')),
  actif             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  nom            VARCHAR(150) NOT NULL,
  email          VARCHAR(150),
  telephone      VARCHAR(30),
  canal_prefere  VARCHAR(10) NOT NULL DEFAULT 'email'
                 CHECK (canal_prefere IN ('email','sms','whatsapp')),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (id, entreprise_id)   -- permet la clé étrangère composite des factures
);

-- Factures
CREATE TABLE factures (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  client_id      INT NOT NULL,
  numero         VARCHAR(50) NOT NULL,
  montant        NUMERIC(14,2) NOT NULL CHECK (montant > 0),
  date_emission  DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance  DATE NOT NULL,
  annulee        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (entreprise_id, numero),
  CHECK (date_echeance >= date_emission),
  -- le client doit appartenir à la MÊME entreprise que la facture
  FOREIGN KEY (client_id, entreprise_id)
    REFERENCES clients (id, entreprise_id)
);

-- Paiements (les paiements partiels sont possibles)
CREATE TABLE paiements (
  id             SERIAL PRIMARY KEY,
  facture_id     INT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  montant        NUMERIC(14,2) NOT NULL CHECK (montant > 0),
  date_paiement  DATE NOT NULL DEFAULT CURRENT_DATE,
  mode           VARCHAR(20) DEFAULT 'especes'
);

-- Règles de relance (ex : J+3, J+10, J+20)
CREATE TABLE regles_relance (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  jours_retard   INT NOT NULL CHECK (jours_retard >= 0),
  message        TEXT NOT NULL,
  actif          BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (entreprise_id, jours_retard)
);

-- Historique des relances
-- 'a_envoyer' = préparée (ex : WhatsApp en attente du clic), pas encore envoyée
CREATE TABLE relances (
  id          SERIAL PRIMARY KEY,
  facture_id  INT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  regle_id    INT REFERENCES regles_relance(id),
  canal       VARCHAR(10) NOT NULL,
  statut      VARCHAR(10) NOT NULL DEFAULT 'a_envoyer'
              CHECK (statut IN ('a_envoyer','envoyee','echec')),
  message     TEXT,
  erreur      TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  envoyee_le  TIMESTAMP,                 -- renseignée à l'envoi effectif
  UNIQUE (facture_id, regle_id)          -- évite d'envoyer 2 fois la même relance
);

-- Recettes / dépenses prévues (loyer, salaires, abonnements...)
CREATE TABLE mouvements_prevus (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  libelle        VARCHAR(150) NOT NULL,
  type           VARCHAR(10) NOT NULL CHECK (type IN ('recette','depense')),
  montant        NUMERIC(14,2) NOT NULL CHECK (montant > 0),
  date_prevue    DATE NOT NULL,
  recurrence     VARCHAR(10) NOT NULL DEFAULT 'aucune'
                 CHECK (recurrence IN ('aucune','hebdo','mensuelle','annuelle'))
);

-- Solde de départ pour la trésorerie
CREATE TABLE soldes (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  montant        NUMERIC(14,2) NOT NULL,
  date_solde     DATE NOT NULL DEFAULT CURRENT_DATE
);

-- =========================================================
-- Index
-- =========================================================
CREATE INDEX idx_users_entreprise     ON users(entreprise_id);
CREATE INDEX idx_clients_entreprise   ON clients(entreprise_id);
CREATE INDEX idx_factures_echeance    ON factures(entreprise_id, date_echeance);
CREATE INDEX idx_factures_client      ON factures(client_id);
CREATE INDEX idx_paiements_facture    ON paiements(facture_id);

-- =========================================================
-- Protection : un paiement ne peut pas dépasser le reste à payer
-- (dernier filet de sécurité, en plus du contrôle dans le backend)
-- =========================================================
CREATE FUNCTION fn_verifier_paiement() RETURNS TRIGGER AS $$
DECLARE
  v_montant    NUMERIC(14,2);
  v_annulee    BOOLEAN;
  v_deja_paye  NUMERIC(14,2);
BEGIN
  -- verrouille la facture pour éviter deux paiements simultanés
  SELECT montant, annulee INTO v_montant, v_annulee
  FROM factures WHERE id = NEW.facture_id FOR UPDATE;

  IF v_annulee THEN
    RAISE EXCEPTION 'Facture annulée : paiement impossible';
  END IF;

  SELECT COALESCE(SUM(montant), 0) INTO v_deja_paye
  FROM paiements
  WHERE facture_id = NEW.facture_id
    AND id IS DISTINCT FROM NEW.id;

  IF v_deja_paye + NEW.montant > v_montant THEN
    RAISE EXCEPTION 'Paiement trop élevé : reste à payer = %',
      v_montant - v_deja_paye;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verifier_paiement
BEFORE INSERT OR UPDATE ON paiements
FOR EACH ROW EXECUTE FUNCTION fn_verifier_paiement();

-- =========================================================
-- Vues
-- =========================================================

-- Statut calculé de chaque facture
CREATE VIEW v_factures_statut AS
SELECT
  f.id, f.entreprise_id, f.client_id, f.numero, f.montant,
  f.date_echeance,
  COALESCE(SUM(p.montant), 0)                  AS montant_paye,
  f.montant - COALESCE(SUM(p.montant), 0)      AS reste_a_payer,
  CASE
    WHEN f.annulee THEN 'annulee'
    WHEN f.montant - COALESCE(SUM(p.montant), 0) <= 0 THEN 'payee'
    WHEN f.date_echeance < CURRENT_DATE THEN 'en_retard'
    ELSE 'en_attente'
  END AS statut,
  GREATEST(CURRENT_DATE - f.date_echeance, 0)  AS jours_retard
FROM factures f
LEFT JOIN paiements p ON p.facture_id = f.id
GROUP BY f.id;

-- Créances : tout ce qu'on nous doit (échu ou non)
-- pour répondre à "Qui me doit le plus ?"
CREATE VIEW v_creances_par_client AS
SELECT
  c.entreprise_id, c.id AS client_id, c.nom,
  COUNT(*)              AS nb_factures,
  SUM(v.reste_a_payer)  AS total_du,
  MAX(v.jours_retard)   AS retard_max
FROM v_factures_statut v
JOIN clients c ON c.id = v.client_id
WHERE v.statut IN ('en_attente', 'en_retard')
GROUP BY c.entreprise_id, c.id, c.nom;

-- Impayés : seulement les factures en retard (pour les relances)
CREATE VIEW v_impayes_par_client AS
SELECT
  c.entreprise_id, c.id AS client_id, c.nom,
  COUNT(*)              AS nb_factures,
  SUM(v.reste_a_payer)  AS total_du,
  MAX(v.jours_retard)   AS retard_max
FROM v_factures_statut v
JOIN clients c ON c.id = v.client_id
WHERE v.statut = 'en_retard'
GROUP BY c.entreprise_id, c.id, c.nom;