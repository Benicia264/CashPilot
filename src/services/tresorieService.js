import * as repo from '../repositories/tresorerieRepository.js';

const HORIZONS = [30, 60, 90];
const SCENARIOS = ['prudent', 'probable'];
const DELAI_RETARD = 15; // scénario probable : retards encaissés à J+15
const DEVISE = 'FCFA';
const MS_PAR_JOUR = 86400000;

const CHAMPS_MOUVEMENT = ['libelle', 'type', 'montant', 'datePrevue', 'recurrence'];

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

const filtrer = (corps, champs) =>
  Object.fromEntries(Object.entries(corps).filter(([cle]) => champs.includes(cle)));

// --- Argent : on calcule en centimes (entiers) ---
const centimes = (valeur) => Math.round(Number(valeur) * 100);
const enMontant = (c) => c / 100;
const fmt = (c) => `${enMontant(c).toLocaleString('fr-FR')} ${DEVISE}`;

// --- Dates : toujours en UTC, au format 'AAAA-MM-JJ' ---
const enDate = (texte) => new Date(`${texte}T00:00:00Z`);
const enTexte = (date) => date.toISOString().slice(0, 10);

const ajouterJours = (date, n) => {
  const r = new Date(date);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
};

// Ajoute n mois depuis la date d'origine (31 janvier + 1 mois = 28 février)
const ajouterMois = (date, n) => {
  const annee = date.getUTCFullYear();
  const mois = date.getUTCMonth() + n;
  const jour = date.getUTCDate();
  const dernierJour = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
  return new Date(Date.UTC(annee, mois, Math.min(jour, dernierJour)));
};

// Toutes les dates d'un mouvement tombant entre debut et fin (inclus)
const occurrences = (mouvement, debut, fin) => {
  const base = enDate(mouvement.datePrevue);

  if (mouvement.recurrence === 'aucune') {
    return base >= debut && base <= fin ? [base] : [];
  }

  const dates = [];
  for (let n = 0; n < 2000; n++) {
    let date;
    if (mouvement.recurrence === 'hebdo') date = ajouterJours(base, 7 * n);
    else if (mouvement.recurrence === 'mensuelle') date = ajouterMois(base, n);
    else date = ajouterMois(base, 12 * n);

    if (date > fin) break;
    if (date >= debut) dates.push(date);
  }
  return dates;
};

// ================= Projection =================
export const projeter = async (entrepriseId, scenario = 'prudent') => {
  if (!SCENARIOS.includes(scenario)) {
    throw erreur(`Scénario invalide (${SCENARIOS.join(', ')})`, 400);
  }

  const solde = await repo.dernierSolde(entrepriseId);
  if (!solde) {
    throw erreur(
      "Aucun solde enregistré : enregistrez d'abord votre solde actuel (POST /api/tresorerie/solde)",
      409
    );
  }

  const aujourdhui = enDate(await repo.dateDuJour());
  const fin = ajouterJours(aujourdhui, Math.max(...HORIZONS));
  const soldeInitial = centimes(solde.montant);

  const evenements = [];
  let retardsExclus = 0;

  // 1. Factures à encaisser
  for (const f of await repo.facturesAEncaisser(entrepriseId)) {
    let date;
    if (f.statut === 'en_retard') {
      if (scenario === 'prudent') {
        retardsExclus += centimes(f.resteAPayer);
        continue;
      }
      date = ajouterJours(aujourdhui, DELAI_RETARD);
    } else {
      date = enDate(f.dateEcheance);
    }
    if (date <= fin) {
      evenements.push({
        date,
        libelle: `Facture ${f.numero}`,
        montant: centimes(f.resteAPayer),
      });
    }
  }

  // 2. Mouvements prévus (avec leurs répétitions)
  for (const m of await repo.trouverMouvements(entrepriseId)) {
    const signe = m.type === 'recette' ? 1 : -1;
    for (const date of occurrences(m, aujourdhui, fin)) {
      evenements.push({ date, libelle: m.libelle, montant: signe * centimes(m.montant) });
    }
  }

  // 3. Tri par date ; le même jour, les dépenses passent avant les recettes (prudence)
  evenements.sort((a, b) => a.date - b.date || a.montant - b.montant);

  // 4. Solde après chaque événement
  let courant = soldeInitial;
  const chronologie = evenements.map((e) => {
    courant += e.montant;
    return { ...e, soldeApres: courant };
  });

  // 5. Bilan pour chaque horizon
  const calculerHorizon = (jours) => {
    const limite = ajouterJours(aujourdhui, jours);
    const concernes = chronologie.filter((e) => e.date <= limite);

    let minimum = soldeInitial;
    let dateMinimum = enTexte(aujourdhui);
    let premierDecouvert = soldeInitial < 0 ? enTexte(aujourdhui) : null;

    for (const e of concernes) {
      if (e.soldeApres < minimum) {
        minimum = e.soldeApres;
        dateMinimum = enTexte(e.date);
      }
      if (e.soldeApres < 0 && !premierDecouvert) premierDecouvert = enTexte(e.date);
    }

    return {
      jours,
      dateFin: enTexte(limite),
      encaissements: enMontant(
        concernes.filter((e) => e.montant > 0).reduce((s, e) => s + e.montant, 0)
      ),
      depenses: enMontant(
        -concernes.filter((e) => e.montant < 0).reduce((s, e) => s + e.montant, 0)
      ),
      soldePrevu: enMontant(concernes.length ? concernes.at(-1).soldeApres : soldeInitial),
      soldeMinimum: enMontant(minimum),
      dateSoldeMinimum: dateMinimum,
      decouvert: minimum < 0,
      datePremierDecouvert: premierDecouvert,
    };
  };

  const horizons = HORIZONS.map(calculerHorizon);

  // 6. Alerte
  const alertes = [];
  const dernier = horizons.at(-1);
  if (dernier.datePremierDecouvert) {
    const delai = Math.round((enDate(dernier.datePremierDecouvert) - aujourdhui) / MS_PAR_JOUR);
    alertes.push(
      delai <= 0
        ? `Attention : votre solde est déjà négatif. Point le plus bas : ${dernier.soldeMinimum} ${DEVISE} le ${dernier.dateSoldeMinimum}.`
        : `Attention : découvert prévu le ${dernier.datePremierDecouvert} (dans ${delai} jour${delai > 1 ? 's' : ''}). Point le plus bas : ${dernier.soldeMinimum} ${DEVISE} le ${dernier.dateSoldeMinimum}.`
    );
  }

  // 7. Hypothèses (transparence sur ce qui est supposé)
  const hypotheses = [
    `Le solde enregistré (${enMontant(soldeInitial)} ${DEVISE}, au ${solde.dateSolde}) est considéré comme votre solde d'aujourd'hui.`,
    "Les factures non échues sont encaissées à leur date d'échéance.",
    scenario === 'prudent'
      ? `Scénario prudent : les factures en retard ne sont pas comptées (${fmt(retardsExclus)} exclus).`
      : `Scénario probable : les factures en retard sont encaissées ${DELAI_RETARD} jours après aujourd'hui.`,
  ];

  return {
    scenario,
    aujourdhui: enTexte(aujourdhui),
    soldeActuel: { montant: enMontant(soldeInitial), dateSolde: solde.dateSolde },
    horizons,
    alertes,
    hypotheses,
    evenements: chronologie.map((e) => ({
      date: enTexte(e.date),
      libelle: e.libelle,
      montant: enMontant(e.montant),
      soldeApres: enMontant(e.soldeApres),
    })),
  };
};

// ================= Solde =================
export const obtenirSolde = async (entrepriseId) => {
  const solde = await repo.dernierSolde(entrepriseId);
  if (!solde) throw erreur('Aucun solde enregistré', 404);
  return solde;
};

export const enregistrerSolde = (corps, entrepriseId) => {
  const montant = Number(corps.montant);
  if (corps.montant === undefined || corps.montant === null || !Number.isFinite(montant)) {
    throw erreur('Le montant doit être un nombre', 400);
  }
  return repo.creerSolde({
    entrepriseId,
    montant: centimes(montant) / 100,
    ...(corps.dateSolde && { dateSolde: corps.dateSolde }),
  });
};

// ================= Mouvements prévus =================
export const listerMouvements = (entrepriseId) => repo.trouverMouvements(entrepriseId);

export const creerMouvement = (corps, entrepriseId) =>
  repo.creerMouvement({ ...filtrer(corps, CHAMPS_MOUVEMENT), entrepriseId });

export const supprimerMouvement = async (id, entrepriseId) => {
  const mouvement = await repo.trouverMouvementParId(id, entrepriseId);
  if (!mouvement) throw erreur('Mouvement introuvable', 404);
  await repo.supprimerMouvement(mouvement);
};