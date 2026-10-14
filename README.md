# CashPilot

**CashPilot** est une application web de gestion de trésorerie pour petites et moyennes entreprises. Elle suit les factures et les paiements, relance automatiquement les clients en retard (email et WhatsApp), prévoit la trésorerie à 30, 60 et 90 jours et répond aux questions du dirigeant sur ses chiffres.

Projet réalisé dans le cadre de la formation Fullstack d'Akieni Academy.

- Dépôt : https://github.com/Benicia264/CashPilot
- Déploiement : frontend sur Netlify, API sur Render, base de données sur Neon.

## Sommaire

1. [Présentation](#1-présentation)
2. [État d'avancement](#2-état-davancement)
3. [Stack technique](#3-stack-technique)
4. [Architecture](#4-architecture)
5. [Base de données](#5-base-de-données)
6. [Règles métier](#6-règles-métier)
7. [Référence de l'API](#7-référence-de-lapi)
8. [Authentification et rôles](#8-authentification-et-rôles)
9. [Frontend et design](#9-frontend-et-design)
10. [Installation en développement](#10-installation-en-développement)
11. [Variables d'environnement](#11-variables-denvironnement)
12. [Docker](#12-docker)
13. [Déploiement](#13-déploiement)
14. [Jeu de données de test](#14-jeu-de-données-de-test)
15. [Tester l'application](#15-tester-lapplication)
16. [Choix techniques](#16-choix-techniques)
17. [Sécurité](#17-sécurité)
18. [Dépannage](#18-dépannage)
19. [Ajouter une page ou un module](#19-ajouter-une-page-ou-un-module)
20. [Feuille de route](#20-feuille-de-route)
21. [Conventions et Git](#21-conventions-et-git)
22. [Licence et auteur](#22-licence-et-auteur)

---

## 1. Présentation

### Le problème

Une entreprise qui vend bien peut manquer d'argent : les factures sont payées en retard, alors que les charges (salaires, loyer, fournisseurs) tombent à date fixe. Sans vue claire sur qui doit quoi, on relance trop tard et on découvre le trou de trésorerie quand il est déjà là.

### La solution

CashPilot rassemble au même endroit :

- le **suivi des factures et des paiements**, avec un statut calculé automatiquement ;
- des **relances automatiques** selon des règles (J+3, J+10, J+20...), sans jamais envoyer deux fois le même message ;
- une **trésorerie prévisionnelle** à 30, 60 et 90 jours, avec alerte avant tout découvert ;
- un **assistant** qui répond à des questions courantes (« Qui me doit le plus ? ») avec les vrais chiffres de l'entreprise ;
- un **tableau de bord** lisible : indicateurs, variations, graphiques.

Les montants sont exprimés en FCFA. L'application est multi-entreprises : chaque entreprise ne voit que ses propres données.

---

## 2. État d'avancement

| Domaine | État |
|---|---|
| Base de données (schéma, vues, trigger) | Terminé |
| API : authentification, utilisateurs et rôles | Terminé |
| API : clients, factures, paiements | Terminé |
| API : trésorerie (solde, mouvements prévus, projection) | Terminé |
| API : relances (règles, moteur, email, WhatsApp, tâche quotidienne) | Terminé |
| API : assistant et synthèse du tableau de bord | Terminé |
| Frontend : accueil animée, connexion, inscription | Terminé |
| Frontend : navigation responsive (ordinateur et téléphone) | Terminé |
| Frontend : tableau de bord | Terminé |
| Frontend : clients et factures | Terminé |
| Frontend : trésorerie (graphiques) | Terminé |
| Frontend : relances et assistant | Terminé |
| Conteneurisation (Docker) | Terminé |
| Déploiement : Netlify (frontend), Render (API), Neon (base) | Terminé |

---

## 3. Stack technique

**Backend**

- Node.js (modules ES) et Express 5
- PostgreSQL avec Sequelize (ORM) ; SQL brut pour les requêtes complexes
- JSON Web Token (`jsonwebtoken`) et `bcryptjs` pour l'authentification
- `node-cron` pour la tâche quotidienne de relances
- `nodemailer` pour l'envoi d'emails (Ethereal en test, SMTP réel ensuite)
- `dotenv`, `cors`
- Outils de développement : `nodemon`, `concurrently`

**Frontend**

- React avec Vite
- `react-router-dom` (navigation), `recharts` (graphiques), `lucide-react` (icônes)
- CSS simple avec variables (aucune bibliothèque de composants)
- Polices Google Fonts : Sora (titres et chiffres) et Onest (texte)

**Infrastructure**

- Docker : image `node:18-alpine` pour l'API, image `postgres:15-alpine` pour la base
- Netlify : hébergement du frontend
- Render : hébergement de l'API
- Neon : PostgreSQL hébergé

---

## 4. Architecture

### Vue d'ensemble en production

```text
Navigateur
   |
   v
Netlify  ->  Render  ->  Neon
(frontend    (API Node   (PostgreSQL
 React)       Express)    hébergé)
```

### Le trajet d'une requête dans l'API

```text
Requête HTTP
  -> route          (adresse et méthode)
  -> middleware     (authentification, rôle)
  -> controller     (lit la requête, renvoie la réponse)
  -> service        (logique métier, règles)
  -> repository     (seul endroit qui parle à la base)
  -> model          (description et validation, Sequelize)
  -> PostgreSQL
```

Chaque couche a un seul rôle. Le SQL est isolé dans les repositories, la logique métier dans les services (réutilisables par l'API et par la tâche planifiée).

### Arborescence

```text
CashPilot/
├── .env                      (secrets, jamais publié)
├── .env.example              (modèle du fichier .env)
├── Dockerfile                (image de l'API)
├── docker-compose.yml        (API + PostgreSQL)
├── netlify.toml              (configuration Netlify)
├── package.json
├── README.md
├── database/
│   └── schema.sql            (schéma complet : tables, vues, trigger)
├── src/
│   ├── server.js             (démarrage : base, serveur, tâche cron)
│   ├── app.js                (middlewares, routes, protection)
│   ├── config/db.js          (connexion Sequelize)
│   ├── models/               (clientModel, factureModel, factureStatutModel,
│   │                          paiementModel, regleRelanceModel, relanceModel,
│   │                          soldeModel, mouvementPrevuModel,
│   │                          entrepriseModel, userModel)
│   ├── routes/               (authRoute, userRoute, clientRoute, factureRoute,
│   │                          paiementRoute, assistantRoute, tresorerieRoute,
│   │                          relanceRoute, dashboardRoute)
│   ├── controllers/          (un par route)
│   ├── services/             (authService, userService, clientService,
│   │                          factureService, paiementService, assistantService,
│   │                          tresorerieService, relanceService,
│   │                          notificationService, dashboardService)
│   ├── repositories/         (client, facture, paiement, assistant, tresorerie,
│   │                          relance, user, entreprise, dashboard)
│   ├── middlewares/          (authMiddleware, errorHandler)
│   ├── jobs/relanceJob.js    (tâche quotidienne à 08:00)
│   └── utils/                (securite.js, telephone.js)
└── frontend/
    ├── index.html
    ├── vite.config.js        (proxy /api vers http://localhost:3000)
    ├── public/favicon.svg
    └── src/
        ├── main.jsx          (point d'entrée)
        ├── App.jsx           (routes)
        ├── api/client.js     (appels au backend, jeton, erreurs)
        ├── context/AuthContext.jsx
        ├── hooks/useApi.js
        ├── utils/format.js   (montants, dates, pourcentages)
        ├── components/       (Layout, RouteProtegee, Marque, PageAuth,
        │                      ApercuProduit, HistoireTresorerie,
        │                      Graphiques, Modal)
        ├── pages/            (une page par écran)
        └── styles/           (global.css, theme.css, app.css, auth.css,
                               landing.css, histoire.css, dashboard.css,
                               pages.css)
```

### Asynchronisme

Tout le backend est asynchrone (`async` / `await`) : la base de données, l'envoi d'emails et le hachage des mots de passe sont des opérations lentes qui ne doivent pas bloquer le serveur. Les cas notables : transactions (`sequelize.transaction`), requêtes parallèles (`Promise.all` dans le tableau de bord), `await` au premier niveau dans `server.js`.

---

## 5. Base de données

PostgreSQL. Le fichier `database/schema.sql` est la référence. Le statut d'une facture n'est **jamais stocké** : il est calculé par une vue.

### Tables

| Table | Rôle |
|---|---|
| `entreprises` | Une ligne par entreprise cliente |
| `users` | Utilisateurs (rattachés à une entreprise), mot de passe haché, rôle, actif |
| `clients` | Clients de l'entreprise (email, téléphone, canal de relance préféré) |
| `factures` | Factures (numéro unique par entreprise, montant, émission, échéance, annulée) |
| `paiements` | Paiements, éventuellement partiels, d'une facture |
| `regles_relance` | Règles « à J+N de retard, envoyer ce message » |
| `relances` | Historique : statut `a_envoyer`, `envoyee` ou `echec`, message, erreur |
| `mouvements_prevus` | Recettes et dépenses prévues, avec récurrence |
| `soldes` | Soldes enregistrés (le plus récent sert de point de départ) |

### Vues

| Vue | Rôle |
|---|---|
| `v_factures_statut` | Montant payé, reste à payer, statut calculé (`en_attente`, `en_retard`, `payee`, `annulee`) et jours de retard |
| `v_creances_par_client` | Tout ce que chaque client doit (échu ou non) |
| `v_impayes_par_client` | Seulement les factures en retard |

### Protections dans la base

- **Clé étrangère composite** : une facture ne peut référencer qu'un client de **la même entreprise** (`FOREIGN KEY (client_id, entreprise_id)`).
- **Trigger `fn_verifier_paiement`** : refuse un paiement qui dépasse le reste à payer ou qui vise une facture annulée (verrouillage de la ligne pour éviter deux paiements simultanés).
- `UNIQUE (facture_id, regle_id)` sur `relances` : une même relance ne peut pas être créée deux fois.
- Contraintes `CHECK` sur les montants, les dates, les rôles, les canaux et les statuts.

---

## 6. Règles métier

### Factures

- Le numéro est unique par entreprise ; l'échéance ne peut pas précéder l'émission.
- Une facture ne se supprime pas : elle s'**annule** (traçabilité comptable). L'annulation est refusée si des paiements existent.
- Une facture annulée n'est plus modifiable. Son montant ne peut pas descendre sous ce qui est déjà payé.

### Paiements

- Un paiement est positif et ne peut pas dépasser le reste à payer.
- Contrôle en deux couches : le service (transaction avec verrou `FOR UPDATE`) puis le trigger SQL en dernier filet.
- Modes acceptés : `especes`, `virement`, `cheque`, `mobile_money`, `carte`.

### Relances

- Chaque jour à 08:00 (fuseau `Africa/Brazzaville`), puis à la demande (`POST /api/relances/executer`), le moteur parcourt les factures en retard.
- Pour chaque facture, il retient **la règle la plus élevée atteinte** (jamais trois messages d'un coup) et ignore celles déjà traitées.
- La relance est **réservée en base avant l'envoi** : même si deux traitements se croisent, le même message ne part qu'une fois.
- Les messages utilisent des variables : `{client}`, `{entreprise}`, `{numero}`, `{reste}`, `{echeance}`, `{jours}`.
- Canaux, selon `canal_prefere` du client :
  - **Email** : envoi automatique (Nodemailer). Sans configuration SMTP, le serveur de test Ethereal est utilisé : aucun vrai email n'est envoyé, l'URL d'aperçu est renvoyée.
  - **WhatsApp** : relance préparée avec le statut `a_envoyer` et un lien `wa.me` ; le gestionnaire l'envoie en un geste puis la marque comme envoyée.
  - **SMS** : pas encore disponible (ignoré avec une explication).
- Si un client n'a pas le contact nécessaire (email ou téléphone), la relance est ignorée et réévaluée au prochain passage.
- Les numéros sont convertis au format international à la volée (`+...`, `00...`, ou indicatif `INDICATIF_PAYS` ajouté).

### Trésorerie prévisionnelle

- Point de départ : le dernier solde enregistré (considéré comme le solde du jour).
- Événements sur 90 jours : factures à encaisser à leur échéance, plus les mouvements prévus répétés selon leur récurrence (`aucune`, `hebdo`, `mensuelle`, `annuelle`).
- Deux scénarios : **prudent** (les factures en retard ne sont pas comptées) et **probable** (supposées payées à J+15).
- Le même jour, les dépenses passent avant les recettes (prudence). Les calculs se font en centimes.
- Sortie : solde prévu, point le plus bas, date du premier découvert, alertes et hypothèses retenues.

### Assistant

Six questions prédéfinies, reconnues par mots-clés (sans accents) et traitées par des requêtes SQL fixes sur les vues : « Qui me doit le plus ? », « Montant total des impayés », « Factures en retard », « Ancienneté des retards », « À encaisser ce mois-ci », « Quels clients ont payé ? ». La fonction `detecterIntention` est le seul point à remplacer pour brancher plus tard un modèle de langage.

### Tableau de bord

Les variations comparent la situation actuelle à celle de la **fin du mois précédent** (créances, retards, taux de recouvrement). Le « encaissé du mois » compare le mois en cours au mois précédent. Le taux de recouvrement est la part du montant des factures échues déjà encaissée.

---

## 7. Référence de l'API

Préfixe : `/api`. Format JSON. Les endpoints protégés demandent l'en-tête `Authorization: Bearer <jeton>`.

### Publics

| Méthode | Adresse | Corps | Rôle |
|---|---|---|---|
| GET | `/sante` | | Vérifier que le serveur répond |
| POST | `/auth/inscription` | `entrepriseNom`, `nom`, `email`, `motDePasse` | Crée l'entreprise et son propriétaire, renvoie `jeton` et `utilisateur` |
| POST | `/auth/connexion` | `email`, `motDePasse` | Renvoie `jeton` et `utilisateur` |

### Protégés

| Méthode | Adresse | Corps ou paramètres | Rôle |
|---|---|---|---|
| GET | `/auth/moi` | | Profil et entreprise de l'utilisateur connecté |
| GET | `/dashboard` | | Indicateurs, variations, statuts, créances par client |
| GET | `/clients` | | Liste |
| GET | `/clients/:id` | | Détail |
| POST | `/clients` | `nom`, `email`, `telephone`, `canalPrefere` | Création |
| PUT | `/clients/:id` | mêmes champs | Modification |
| DELETE | `/clients/:id` | | Suppression (409 si des factures existent) |
| GET | `/factures` | `?statut=en_attente\|en_retard\|payee\|annulee` | Liste avec statut calculé |
| GET | `/factures/:id` | | Détail avec statut calculé |
| POST | `/factures` | `clientId`, `numero`, `montant`, `dateEmission?`, `dateEcheance` | Création |
| PUT | `/factures/:id` | `numero`, `montant`, `dateEmission`, `dateEcheance` | Modification |
| PATCH | `/factures/:id/annuler` | | Annulation |
| GET | `/factures/:factureId/paiements` | | Paiements d'une facture |
| POST | `/factures/:factureId/paiements` | `montant`, `datePaiement?`, `mode?` | Enregistre un paiement, renvoie `{ paiement, facture }` |
| GET | `/tresorerie/projection` | `?scenario=prudent\|probable` | Projection à 30, 60 et 90 jours (409 si aucun solde) |
| GET | `/tresorerie/solde` | | Dernier solde |
| POST | `/tresorerie/solde` | `montant`, `dateSolde?` | Enregistre un solde |
| GET | `/tresorerie/mouvements` | | Mouvements prévus |
| POST | `/tresorerie/mouvements` | `libelle`, `type` (`recette`\|`depense`), `montant`, `datePrevue`, `recurrence` | Création |
| DELETE | `/tresorerie/mouvements/:id` | | Suppression |
| GET | `/relances/regles` | | Règles de relance |
| POST | `/relances/regles` | `joursRetard`, `message`, `actif?` | Création (409 si le délai existe déjà) |
| PUT | `/relances/regles/:id` | mêmes champs | Modification |
| DELETE | `/relances/regles/:id` | | Suppression |
| GET | `/relances` | `?statut=a_envoyer\|envoyee\|echec` | Historique (avec `lienWhatsApp` pour les relances à envoyer) |
| POST | `/relances/executer` | | Lance le moteur de relances pour l'entreprise |
| PATCH | `/relances/:id/envoyee` | | Marque une relance WhatsApp comme envoyée |
| PATCH | `/relances/:id/renvoyer` | | Retente un envoi en échec |
| GET | `/assistant/questions` | | Questions proposées |
| POST | `/assistant` | `question` | Réponse (`intention`, `reponse`, `donnees`) |
| GET | `/users` | | Équipe (propriétaire seulement) |
| POST | `/users` | `nom`, `email`, `motDePasse`, `role` | Crée un compte (propriétaire) |
| PATCH | `/users/:id` | `nom`, `role`, `actif` | Modifie un compte (propriétaire, pas le sien) |

### Format des réponses

- Les montants décimaux sont renvoyés **sous forme de texte** (`"500000.00"`) pour préserver la précision. Les dates sont au format `AAAA-MM-JJ`.
- Les endpoints basés sur les models renvoient des champs en camelCase (`resteAPayer`). Ceux basés sur du SQL brut (historique des relances, `donnees` de l'assistant) renvoient des noms de colonnes en snake_case (`created_at`).
- Erreurs : `{ "erreur": "message" }`, ou un tableau de messages pour les validations.

| Code | Signification |
|---|---|
| 400 | Données invalides |
| 401 | Non connecté, jeton invalide ou expiré, compte désactivé |
| 403 | Droits insuffisants (rôle) |
| 404 | Ressource introuvable (ou appartenant à une autre entreprise) |
| 409 | Conflit : doublon, règle métier, aucun solde enregistré |
| 502 | Échec d'un envoi (nouvelle tentative d'une relance) |
| 500 | Erreur serveur |

---

## 8. Authentification et rôles

- L'inscription crée **l'entreprise et son propriétaire dans une seule transaction**.
- Mot de passe : 8 à 72 caractères, haché avec bcrypt (12 tours), jamais stocké en clair, jamais chargé sauf à la connexion.
- Le jeton JWT (HS256) ne contient que l'identifiant de l'utilisateur. À **chaque requête**, l'utilisateur est relu en base : désactiver un compte ou changer un rôle prend effet immédiatement.
- Connexion : même message d'erreur et même temps de traitement que l'email existe ou non.
- L'entreprise est toujours déduite du jeton (`req.entrepriseId`) et jamais fournie par le client : une entreprise ne peut pas lire les données d'une autre.

| Rôle | Droits |
|---|---|
| `proprietaire` | Tout, y compris la gestion de l'équipe |
| `gestionnaire` | Lecture et écriture sur les données de l'entreprise |
| `lecteur` | Consultation seulement (peut poser des questions à l'assistant) |

---

## 9. Frontend et design

### Pages

| Page | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | En-tête animé (la courbe de trésorerie se trace, l'alerte de découvert apparaît), tuiles de fonctionnalités, **scène épinglée au défilement** (solde, courbe et événements avancent avec le défilement : salaires, loyer, découvert le 28 décembre, puis redressement après relances), étapes, section sur les données, appel final |
| Connexion, inscription | `/connexion`, `/inscription` | Formulaires avec messages d'erreur |
| Tableau de bord | `/app` | Quatre indicateurs avec variations, courbe de trésorerie (prudent / probable, solde à saisir si absent), créances par client, répartition des factures, entrées et sorties par semaine |
| Clients | `/app/clients` | Liste, recherche, ajout, modification, suppression avec confirmation |
| Factures | `/app/factures` | Gestion des factures et de leurs paiements |
| Trésorerie | `/app/tresorerie` | Trésorerie prévue, avec graphiques |
| Relances | `/app/relances` | Gestion des relances |
| Assistant | `/app/assistant` | Questions à l'assistant, qui répond avec les chiffres de l'entreprise |

### Navigation

- Ordinateur : barre du haut avec navigation en pastilles, cloche (relances), paramètres, avatar, déconnexion.
- Téléphone : barre du bas (Accueil, Factures, Clients, Trésorerie) et feuille « Plus » (pages secondaires et déconnexion).
- Le responsive a été testé sur ordinateur et sur téléphone.

### Identité visuelle

| Couleur | Valeur | Usage |
|---|---|---|
| Nuit | `#16165C` | Structure, titres |
| Outremer | `#4B47E5` | Actions principales, page active |
| Ivoire | `#F8F7F3` | Fond |
| Ambre | `#E7B63C` | Accent, « en attente » |
| Vert | `#2F7D4F` | « Payée », variations positives |
| Rouge | `#C8453B` | « En retard », découvert |

- Polices : Sora (titres, chiffres) et Onest (texte).
- Les couleurs sont des variables CSS. `theme.css` est chargé **en dernier** dans `main.jsx` et redéfinit la palette finale.
- Les animations sont discrètes et respectent `prefers-reduced-motion`.

### Fonctionnement du frontend

- `api/client.js` : point d'entrée unique vers le backend. Il ajoute le jeton, lit les erreurs (`ErreurApi` avec `statut`) et déconnecte l'utilisateur si le serveur répond 401. Le jeton est stocké dans `localStorage` (clé `cashpilot_jeton`).
- `context/AuthContext.jsx` : fournit `utilisateur`, `connecter`, `inscrire`, `deconnecter`, `estProprietaire`, `peutModifier`.
- `components/RouteProtegee.jsx` : réserve les pages aux personnes connectées (option `roles`).
- `hooks/useApi.js` : `const { donnees, erreur, chargement, recharger } = useApi('/clients')`.
- En développement, Vite redirige `/api` vers `http://localhost:3000` : pas de problème de CORS.

---

## 10. Installation en développement

### Prérequis

- Node.js 20.19 ou supérieur (testé avec Node 24)
- PostgreSQL et pgAdmin 4 (ou `psql`)
- Git
- Docker (facultatif, section 12)

### Étapes

```bash
# 1. Récupérer le projet
git clone https://github.com/Benicia264/CashPilot.git
cd CashPilot

# 2. Dépendances du backend et du frontend
npm install
npm --prefix frontend install
```

**3. Créer la base.** Dans pgAdmin : clic droit sur *Databases*, *Create*, *Database*, nom `cashpilot` (en minuscules). Puis ouvrir le *Query Tool* sur cette base, coller le contenu de `database/schema.sql` et l'exécuter (F5). Avec `psql` :

```bash
psql -U postgres -c "CREATE DATABASE cashpilot;"
psql -U postgres -d cashpilot -f database/schema.sql
```

**4. Créer le fichier `.env`** à la racine, en copiant le modèle `.env.example` puis en renseignant les valeurs (variables détaillées section 11).

**5. Lancer l'application :**

```bash
npm run dev:all
```

- API : `http://localhost:3000` (vérification : `http://localhost:3000/api/sante`)
- Interface : `http://localhost:5173`

Pour lancer l'API et la base avec Docker à la place, voir la section 12.

### Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Backend seul, avec rechargement automatique |
| `npm run dev:web` | Frontend seul |
| `npm run dev:all` | Backend et frontend ensemble |
| `npm start` | Backend en mode production |
| `npm --prefix frontend run build` | Compile le frontend pour la production |

> Nodemon ne surveille pas `.env` : après l'avoir modifié, redémarrez le serveur.

---

## 11. Variables d'environnement

Exemple de fichier `.env` en développement :

```env
PORT=3000

DB_NAME=cashpilot
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
DB_HOST=localhost
DB_PORT=5432

# Secret de signature des jetons (32 caractères minimum)
JWT_SECRET=colle_ici_un_secret_long_et_aleatoire
JWT_EXPIRE=8h

# Indicatif ajouté aux numéros locaux pour les liens WhatsApp
INDICATIF_PAYS=242

# Optionnel : vrai serveur d'envoi d'emails (sinon Ethereal, un serveur de test)
# SMTP_HOST=smtp.exemple.com
# SMTP_PORT=587
# SMTP_USER=utilisateur
# SMTP_PASS=mot_de_passe
# SMTP_FROM=CashPilot <no-reply@exemple.com>
```

Pour générer un secret solide :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| Variable | Obligatoire | Description |
|---|---|---|
| `PORT` | Non (3000 par défaut) | Port de l'API (avec Docker, aussi port publié sur la machine) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Oui | Connexion PostgreSQL (avec Docker, aussi identifiants de la base créée) |
| `JWT_SECRET` | Oui | Secret de signature des jetons, 32 caractères minimum (le serveur refuse de démarrer sinon) |
| `JWT_EXPIRE` | Non (`8h`) | Durée de validité d'un jeton |
| `INDICATIF_PAYS` | Non | Indicatif ajouté aux numéros locaux (liens WhatsApp) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Non | Envoi d'emails réel. Sans `SMTP_HOST`, le serveur de test Ethereal est utilisé |

Le fichier `.env` n'est jamais publié (il est dans `.gitignore`). Le modèle `.env.example` sert de point de départ.

---

## 12. Docker

Docker lance l'API et la base PostgreSQL dans deux conteneurs. Seuls ces deux services sont conteneurisés : le frontend se lance avec Vite en développement et se déploie sur Netlify.

### Les fichiers

`Dockerfile` (image de l'API) :

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

`docker-compose.yml` :

```yaml
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
```

### Ce que fait cette configuration

| Élément | Rôle |
|---|---|
| Service `db` (`cashpilot_db`) | PostgreSQL 15. La base, l'utilisateur et le mot de passe viennent de `DB_NAME`, `DB_USER` et `DB_PASSWORD` du fichier `.env` |
| Service `app` (`cashpilot_app`) | L'API, construite depuis le `Dockerfile` (`npm start`), publiée sur le port `PORT` |
| `DB_HOST=db` | Dans Docker, l'API joint la base par le nom du service (`db`), pas par `localhost` |
| Volume `postgres_data` | Conserve les données de la base entre deux démarrages |
| `./database` monté dans `/docker-entrypoint-initdb.d` | À la **première création du volume**, PostgreSQL exécute les fichiers `.sql` de ce dossier, dont `schema.sql` : le schéma est créé automatiquement |
| `restart: always` | Les conteneurs redémarrent automatiquement |
| `depends_on: db` | Le service `app` démarre après le service `db` |

Les variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` et `PORT` sont lues dans le fichier `.env` à la racine.

### Commandes

```bash
docker compose up --build      # construit l'image et démarre les deux services
docker compose up -d           # démarre en arrière-plan
docker compose ps              # état des conteneurs
docker compose logs -f app     # suit les journaux de l'API
docker compose logs -f db      # suit les journaux de la base
docker compose down            # arrête les conteneurs
docker compose down -v         # arrête et supprime aussi les données de la base
```

L'API répond alors sur `http://localhost:3000` (ou le port défini par `PORT`), vérification : `/api/sante`.

> Le schéma n'est exécuté qu'à la première création du volume. Pour le rejouer depuis zéro : `docker compose down -v`, puis `docker compose up --build`.

---

## 13. Déploiement

| Couche | Service | Rôle |
|---|---|---|
| Frontend | **Netlify** | Héberge l'application React compilée. La configuration se trouve dans `netlify.toml` |
| API | **Render** | Exécute le serveur Node/Express |
| Base de données | **Neon** | PostgreSQL hébergé |

Les trois services sont indépendants : le frontend, l'API et la base se déploient et évoluent séparément.

Les variables d'environnement de la section 11 se renseignent dans les paramètres de la plateforme qui héberge l'API. Aucun secret ne doit être écrit dans le dépôt.

---

## 14. Jeu de données de test

Créez d'abord un compte sur `/inscription`. Récupérez l'identifiant de votre entreprise avec `SELECT id, nom FROM entreprises;` et remplacez `1` ci-dessous si besoin. Les dates sont relatives à aujourd'hui.

```sql
INSERT INTO clients (entreprise_id, nom) VALUES
  (1, 'Boulangerie Ngoma'), (1, 'Cabinet Okemba'), (1, 'Transports Itoua');

INSERT INTO factures (entreprise_id, client_id, numero, montant, date_emission, date_echeance)
SELECT 1, c.id, v.numero, v.montant, CURRENT_DATE - v.emis, CURRENT_DATE + v.ech
FROM (VALUES
  ('Boulangerie Ngoma', 'T-001', 800000, 130, -100),
  ('Boulangerie Ngoma', 'T-002', 300000,  40,  -10),
  ('Cabinet Okemba',    'T-003', 500000,  60,  -40),
  ('Cabinet Okemba',    'T-004', 250000,   5,   20),
  ('Transports Itoua',  'T-005', 150000,  30,   -5),
  ('Transports Itoua',  'T-006', 400000,   2,   45)
) AS v(client, numero, montant, emis, ech)
JOIN clients c ON c.nom = v.client AND c.entreprise_id = 1;

INSERT INTO paiements (facture_id, montant, mode)
SELECT id, 100000, 'virement' FROM factures WHERE numero = 'T-002' AND entreprise_id = 1;
INSERT INTO paiements (facture_id, montant, mode)
SELECT id, 150000, 'especes' FROM factures WHERE numero = 'T-005' AND entreprise_id = 1;

INSERT INTO regles_relance (entreprise_id, jours_retard, message) VALUES
(1, 3,  'Bonjour {client}, petit rappel : la facture {numero} de {reste}, échue le {echeance}, n''est pas encore réglée. Merci de votre retour. — {entreprise}'),
(1, 10, 'Bonjour {client}, sauf erreur de notre part, la facture {numero} ({reste}) a {jours} jours de retard. Pouvez-vous la régulariser rapidement ? — {entreprise}'),
(1, 20, 'Bonjour {client}, la facture {numero} ({reste}) est impayée depuis {jours} jours. Merci de nous contacter aujourd''hui pour convenir d''un règlement. — {entreprise}');

INSERT INTO soldes (entreprise_id, montant) VALUES (1, 500000);

INSERT INTO mouvements_prevus (entreprise_id, libelle, type, montant, date_prevue, recurrence) VALUES
  (1, 'Loyer',    'depense', 300000, '2026-01-05', 'mensuelle'),
  (1, 'Salaires', 'depense', 250000, '2026-01-28', 'mensuelle');

-- Contacts pour tester les relances
UPDATE clients SET email = 'ngoma@example.com', canal_prefere = 'email'
WHERE nom = 'Boulangerie Ngoma';
UPDATE clients SET telephone = '+242 06 123 45 67', canal_prefere = 'whatsapp'
WHERE nom = 'Cabinet Okemba';
```

---

## 15. Tester l'application

Avec l'extension Thunder Client de VS Code (en local, adresses en `http://`, pas `https://`) :

1. `POST /api/auth/connexion` : copier le `jeton` de la réponse.
2. Pour les requêtes suivantes, onglet *Auth*, *Bearer*, coller le jeton.
3. Scénarios utiles :
   - `GET /api/dashboard` et `GET /api/tresorerie/projection?scenario=probable` ;
   - `POST /api/factures/:id/paiements` avec un montant supérieur au reste : 409 « Paiement trop élevé » ;
   - `POST /api/relances/executer` : les relances par email renvoient une URL d'aperçu Ethereal à ouvrir dans le navigateur, celles par WhatsApp renvoient un lien `wa.me` ;
   - relancer `executer` une deuxième fois : rien ne part (anti-doublon) ;
   - `POST /api/assistant` avec `{ "question": "Qui me doit le plus ?" }` ;
   - avec un compte `lecteur`, toute écriture renvoie 403 ;
   - avec un second compte (autre entreprise), les listes sont vides : l'isolation fonctionne.

---

## 16. Choix techniques

- **Statut calculé par une vue** plutôt que stocké : impossible qu'il devienne incohérent avec les paiements.
- **Paiements sécurisés à deux niveaux** : transaction avec verrou de ligne côté service, trigger côté base.
- **Clé étrangère composite** : l'isolation entre entreprises est garantie par le schéma, pas seulement par le code.
- **Relances** : sélection de la règle la plus élevée par `DISTINCT ON`, exclusion des relances déjà traitées par `NOT EXISTS`, et réservation de la ligne avant l'envoi grâce à la contrainte `UNIQUE`.
- **Canaux interchangeables** : `notificationService.notifier()` isole les canaux. Brancher l'API officielle WhatsApp Business ou le SMS ne demandera qu'une nouvelle branche dans ce fichier.
- **Assistant sans API payante** : questions prédéfinies et SQL fixe sur les vues (sûr, gratuit, prévisible). Un modèle de langage pourra remplacer `detecterIntention` plus tard.
- **Sequelize et SQL brut** : l'ORM pour les opérations courantes, `sequelize.query` avec paramètres nommés pour les requêtes analytiques.
- **JWT minimal** (identifiant seul) avec relecture de l'utilisateur à chaque requête : révocation et changements de rôle immédiats.
- **Calculs d'argent en centimes** (entiers) pour éviter les erreurs d'arrondi.
- **Frontend sans bibliothèque de composants** : CSS maîtrisé, identité visuelle propre, bundle léger.
- **Docker** : l'API et la base démarrent ensemble avec une seule commande, dans le même environnement sur toutes les machines.
- **Hébergements séparés** : frontend statique (Netlify), API (Render) et base (Neon) se redéploient indépendamment.

---

## 17. Sécurité

Déjà en place :

- mots de passe hachés (bcrypt), secret JWT vérifié au démarrage (32 caractères minimum) ;
- isolation stricte des données par entreprise (jeton, clé composite) ;
- champs du corps de requête filtrés par liste blanche (impossible d'imposer `entrepriseId`) ;
- requêtes SQL paramétrées ; l'assistant n'exécute que des requêtes écrites à l'avance ;
- rôles appliqués côté serveur ; messages d'erreur de connexion identiques ;
- secrets uniquement dans les variables d'environnement (`.env` est dans `.gitignore`).

À faire pour durcir la production :

- limiter les tentatives de connexion (`express-rate-limit`) ;
- restreindre CORS au domaine du frontend (aujourd'hui `cors()` accepte toute origine) ;
- étudier des cookies `HttpOnly` plutôt que `localStorage` pour le jeton ;
- sauvegardes régulières de la base.

---

## 18. Dépannage

| Symptôme | Cause et solution |
|---|---|
| `ERR_MODULE_NOT_FOUND` au démarrage | Un fichier importé n'existe pas ou son nom diffère (majuscules, faute de frappe). Le message donne le chemin à vérifier. Dans les imports de fichiers du projet, l'extension `.js` est obligatoire. |
| `Connexion impossible` au démarrage | Mauvais identifiants dans `.env`, base `cashpilot` absente ou PostgreSQL arrêté. |
| `JWT_SECRET manquant ou trop court` | Ajouter un secret d'au moins 32 caractères dans `.env`, puis redémarrer. |
| `EPROTO ... WRONG_VERSION_NUMBER` dans Thunder Client | L'adresse commence par `https://` alors que le serveur local est en `http://`. |
| `409 Aucun solde enregistré` | Enregistrer un solde (`POST /api/tresorerie/solde`, ou le formulaire du tableau de bord). |
| `Failed to resolve import "./index.css"` | `main.jsx` contient encore le code d'origine de Vite : le remplacer. |
| Les nouvelles couleurs ne s'appliquent pas | `theme.css` doit être importé en dernier dans `main.jsx`. |
| `psql` non reconnu | Utiliser pgAdmin. |
| pgAdmin refuse de supprimer la base (« utilisée par d'autres ») | Arrêter le serveur ou utiliser *Drop Database (Force)*. |
| 401 après avoir recréé la base | Les anciens jetons sont invalides : se reconnecter. |
| Numéros de facture qui sautent (1, 3...) | Normal avec PostgreSQL : un `INSERT` refusé consomme un numéro de séquence. |
| Pas d'email reçu en développement | Ethereal est un faux serveur : ouvrir l'URL d'aperçu renvoyée par `/api/relances/executer`. Il faut une connexion Internet. |
| Polices différentes de celles prévues | Les polices viennent de Google Fonts : connexion Internet nécessaire. |
| Docker : la base est vide au démarrage | `schema.sql` n'est lu qu'à la première création du volume : `docker compose down -v`, puis `docker compose up --build`. |
| Docker : port déjà utilisé | Un autre programme (par exemple PostgreSQL ou l'API lancés hors Docker) occupe le port : l'arrêter avant `docker compose up`. |
| Docker : modification du code non prise en compte | L'image est construite une fois : relancer avec `docker compose up --build`. |

---

## 19. Ajouter une page ou un module

**Un module backend se crée toujours dans cet ordre** : model, repository, service, controller, route, puis enregistrement dans `src/app.js` (avec `protege` pour les routes qui exigent une connexion).

**Une page frontend** :

1. Créer `src/pages/NomPage.jsx` en s'inspirant de `ClientsPage.jsx` (liste, recherche, modale, suppression, messages).
2. L'enregistrer dans `App.jsx`, dans le groupe `/app` : `<Route path="nom" element={<NomPage />} />`.
3. Ajouter le lien dans `components/Layout.jsx` si la page doit apparaître dans le menu.

Ressources réutilisables :

- Appels API : `api(chemin, { methode, corps })` et `useApi(chemin)`.
- Composants : `Modal`, `Graphiques.jsx` (courbe, barres, anneau).
- Formats : `fcfa`, `nombreFr`, `dateCourte`, `dateLongue`, `pourcent`, `pluriel` (`utils/format.js`).
- Classes CSS : `.entete-page`, `.panneau`, `.tableau`, `.badge-retard` / `.badge-attente` / `.badge-payee` / `.badge-annulee`, `.champ`, `.bouton-principal` / `.bouton-secondaire` / `.bouton-danger`, `.notice`, `.message-erreur`, `.etat-vide`, `.segment`, `.recherche`.
- Droits : `const { peutModifier, estProprietaire } = useAuth()` pour masquer les boutons d'écriture aux lecteurs.

---

## 20. Feuille de route

- Regrouper les relances par client (un seul message listant ses factures) au lieu d'un message par facture.
- Canal SMS, puis API officielle WhatsApp Business pour l'envoi automatique.
- Assistant en langage naturel via un modèle de langage (remplacement de `detecterIntention`).
- Mise à jour automatique du solde à partir des paiements.
- Modification des informations de l'entreprise, réinitialisation du mot de passe.
- Pagination des listes, exports PDF et CSV.
- Tests automatisés (services et API), système de migrations de base de données.
- Limitation des tentatives de connexion, restriction de CORS, sauvegardes.
- Intégration et déploiement continus avec vérifications automatiques.

---

## 21. Conventions et Git

**Nommage**

- Fichiers du backend en camelCase, nom au singulier suivi du rôle : `clientRoute.js`, `factureService.js`.
- Composants React en PascalCase (`ClientsPage.jsx`), le reste du frontend en camelCase.
- Code et messages en français, `.js` obligatoire dans les imports de fichiers du projet.
- Les erreurs métier sont levées par les services avec un champ `statut` (code HTTP) et traitées par `errorHandler`.

**Git**

- Une branche par fonctionnalité : `feature/CRUD-factures`, `feature/CRUD-tresorerie`, `feature/CRUD-relances`, `feature/frontend`...
- Messages de commit clairs, à l'impératif : `Ajout des modules clients, factures et paiements`.
- `node_modules` et `.env` ne sont jamais versionnés.

```bash
git checkout -b feature/nom-de-la-fonctionnalite
git add .
git commit -m "Description du changement"
git push -u origin feature/nom-de-la-fonctionnalite
```

---

## 22. Licence et auteur

Licence ISC.

Auteur : Benicia MOUSSANA Développeuse Fullstack.