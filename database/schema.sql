-- Entreprises (une app, plusieurs entreprises)
CREATE TABLE entreprises (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(150) NOT NULL,
  devise      VARCHAR(5) NOT NULL DEFAULT 'XAF',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
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
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Factures
CREATE TABLE factures (
  id             SERIAL PRIMARY KEY,
  entreprise_id  INT NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  client_id      INT NOT NULL REFERENCES clients(id),
  numero         VARCHAR(50) NOT NULL,
  montant        NUMERIC(14,2) NOT NULL CHECK (montant > 0),
  date_emission  DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance  DATE NOT NULL,
  annulee        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (entreprise_id, numero),
  CHECK (date_echeance >= date_emission)
);

-- Paiements (un paiement partiel est possible)
CREATE TABLE paiements (
  id            SERIAL PRIMARY KEY,
  facture_id    INT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  montant       NUMERIC(14,2) NOT NULL CHECK (montant > 0),
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  mode          VARCHAR(20) DEFAULT 'especes'
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

-- Historique des relances envoyées
CREATE TABLE relances (
  id          SERIAL PRIMARY KEY,
  facture_id  INT NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  regle_id    INT REFERENCES regles_relance(id),
  canal       VARCHAR(10) NOT NULL,
  statut      VARCHAR(10) NOT NULL DEFAULT 'envoyee'
              CHECK (statut IN ('envoyee','echec')),
  envoyee_le  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (facture_id, regle_id)  -- évite d'envoyer 2 fois la même relance
);

-- Recettes/dépenses prévues (loyer, salaires, abonnements...)
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

-- Index utiles
CREATE INDEX idx_factures_echeance ON factures(entreprise_id, date_echeance);
CREATE INDEX idx_paiements_facture ON paiements(facture_id);
CREATE INDEX idx_clients_entreprise ON clients(entreprise_id);

-- VUE : statut calculé de chaque facture
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

-- VUE : impayés par client (pour "Qui me doit le plus ?")
CREATE VIEW v_impayes_par_client AS
SELECT
  c.entreprise_id, c.id AS client_id, c.nom,
  SUM(v.reste_a_payer)  AS total_du,
  MAX(v.jours_retard)   AS retard_max
FROM v_factures_statut v
JOIN clients c ON c.id = v.client_id
WHERE v.statut = 'en_retard'
GROUP BY c.entreprise_id, c.id, c.nom;