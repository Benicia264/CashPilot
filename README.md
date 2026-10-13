# CashPilot — SaaS de Gestion de Trésorerie & Relances Clients

> CashPilot est une plateforme SaaS financière conçue pour aider les TPE/PME à piloter leur trésorerie à 30, 60 et 90 jours, suivre le statut de leurs factures et automatiser leurs relances clients par WhatsApp et Email.

---

## Fonctionnalités Principales

* Tableau de Bord & Indicateurs KPI : Vue synthétique des encaissements, des impayés, du taux de recouvrement et des prévisions de trésorerie sur 90 jours.
* Suivi des Factures & Statuts : Calcul automatique des statuts (Payée, En attente, En retard, Annulée) et calcul précis des jours de retard.
* Relances Clients Intelligentes : Génération et envoi de messages de relance personnalisés (WhatsApp & Email).
* Gestion des Créances Clients : Vue détaillée de l'encours par client et historique des paiements.
* Isolation Multi-Entreprises : Étanchéité absolue des données entre entreprises et gestion des rôles (Propriétaire, Gestionnaire, Lecteur).
* Design Modern & Mobile First : Interface réactive, soignée et optimisée pour tous les écrans (Android, iOS, PC).

---

## Stack Technique

* Frontend : React, Vite, React Router, Lucide React, Recharts
* Backend : Node.js (ES Modules), Express.js, Sequelize ORM
* Base de données : PostgreSQL (avec vues aggrégées SQL)
* DevOps & Outils : Docker, Docker Compose, Concurrently

---

## Structure du Dépôt

CashPilot/
├── database/        # Scripts d'initialisation SQL & Vues
├── frontend/        # Application React / Vite
├── src/             # Code source du serveur Backend Express
│   ├── config/      # Configuration BDD & Variables d'environnement
│   ├── controllers/ # Contrôleurs des routes API
│   ├── repositories/# Couche d'accès aux données & requêtes SQL
│   ├── routes/      # Endpoints de l'API
│   └── services/    # Logique métier & calculs de trésorerie
├── .env.example     # Modèle de variables d'environnement
├── Dockerfile       # Configuration Docker pour l'application
├── docker-compose.yml # Orchestration Docker (App + PostgreSQL)
├── package.json     # Orchestration des scripts dev
└── README.md

---

## Configuration & Fichiers de Configuration du Projet

### 1. Variables d'environnement (.env.example)
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cashpilot
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_cle_secrete_ultra_securisee
JWT_EXPIRE=24h
INDICATIF_PAYS=+242

Pour l'utiliser en local :
cp .env.example .env

### 2. Initialisation des Vues PostgreSQL (database/views.sql)
-- 1. Vue pour l'état et le calcul automatique du statut des factures
CREATE OR REPLACE VIEW v_factures_statut AS
SELECT 
  f.id, f.numero, f.entreprise_id, f.client_id, f.montant,
  f.date_emission, f.date_echeance, f.annulee,
  COALESCE(SUM(p.montant), 0) AS montant_paye,
  (f.montant - COALESCE(SUM(p.montant), 0)) AS reste_a_payer,
  CASE 
    WHEN f.annulee THEN 'annulee'
    WHEN COALESCE(SUM(p.montant), 0) >= f.montant THEN 'payee'
    WHEN f.date_echeance < CURRENT_DATE THEN 'en_retard'
    ELSE 'en_attente'
  END AS statut,
  GREATEST(0, (CURRENT_DATE - f.date_echeance)) AS jours_retard
FROM factures f
LEFT JOIN paiements p ON p.facture_id = f.id
GROUP BY f.id;

-- 2. Vue pour le récapitulatif des créances par client
CREATE OR REPLACE VIEW v_creances_par_client AS
SELECT 
  c.id AS client_id, c.entreprise_id, c.nom,
  COUNT(v.id) FILTER (WHERE v.statut IN ('en_attente', 'en_retard')) AS nb_factures,
  COALESCE(SUM(v.reste_a_payer) FILTER (WHERE v.statut IN ('en_attente', 'en_retard')), 0) AS total_du,
  COALESCE(MAX(v.jours_retard) FILTER (WHERE v.statut = 'en_retard'), 0) AS retard_max
FROM clients c
LEFT JOIN v_factures_statut v ON v.client_id = c.id
GROUP BY c.id, c.entreprise_id, c.nom;

### 3. Configuration Docker (Dockerfile)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

### 4. Orchestration Docker (docker-compose.yml)
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: cashpilot_db
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

  app:
    build: .
    container_name: cashpilot_app
    restart: always
    ports:
      - "${PORT}:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db

volumes:
  postgres_data:

---

## Guide d'Utilisation et Lancement

### Lancement Local (Développement)
Pour lancer le serveur backend et l'application frontend simultanément en une seule commande :
npm install
npm run dev:all

* Serveur Backend : http://localhost:3000
* Client Frontend React : http://localhost:5173

### Lancement avec Docker
Pour lancer toute la stack en arrière-plan sans installation locale de PostgreSQL :
docker-compose up --build -d

Pour l'arrêter :
docker-compose down

---

## Auteur & Licence

Développé par Benicia MOUSSANA (https://github.com/Benicia264).  
Projet sous licence MIT.