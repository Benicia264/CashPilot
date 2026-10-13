import * as repo from '../repositories/dashboardRepository.js';

const calculVariation = (actuel, precedent) => {
  if (!precedent || precedent === 0) return actuel > 0 ? 100 : 0;
  return Math.round(((actuel - precedent) / Math.abs(precedent)) * 100);
};

export const synthese = async (entrepriseId) => {
  // Sécurité pour le paramètre entrepriseId
  const eid = Number(entrepriseId) || 1;

  // 1. Récupération des repères de dates
  const repere = await repo.reperesDates();
  const aujourdhui = repere?.aujourdhui || new Date().toISOString().slice(0, 10);
  const finMoisPrecedent = repere?.fin_mois_precedent || aujourdhui;

  // 2. Exécution des requêtes SQL
  const [etatActuel, etatMoisDernier, enc, st, creances] = await Promise.all([
    repo.etatAuJour(eid, aujourdhui).catch(() => ({})),
    repo.etatAuJour(eid, finMoisPrecedent).catch(() => ({})),
    repo.encaissements(eid).catch(() => ({})),
    repo.statuts(eid).catch(() => []),
    repo.creancesParClient(eid).catch(() => []),
  ]);

  // 3. Extraction sécurisée des montants
  const aEncaisserActuel = Number(etatActuel?.a_encaisser || 0);
  const aEncaisserPrecedent = Number(etatMoisDernier?.a_encaisser || 0);

  const enRetardActuel = Number(etatActuel?.en_retard || 0);
  const enRetardPrecedent = Number(etatMoisDernier?.en_retard || 0);

  const ceMois = Number(enc?.ce_mois || 0);
  const moisPrecedent = Number(enc?.mois_precedent || 0);

  const payeEchu = Number(etatActuel?.paye_echu || 0);
  const montantEchu = Number(etatActuel?.montant_echu || 0);
  const tauxActuel = montantEchu > 0 ? Math.round((payeEchu / montantEchu) * 100) : null;

  const payeEchuPrec = Number(etatMoisDernier?.paye_echu || 0);
  const montantEchuPrec = Number(etatMoisDernier?.montant_echu || 0);
  const tauxPrecedent = montantEchuPrec > 0 ? Math.round((payeEchuPrec / montantEchuPrec) * 100) : null;

  return {
    aujourdhui,
    aEncaisser: {
      montant: aEncaisserActuel,
      nbFactures: Number(etatActuel?.nb_a_encaisser || 0),
      variation: calculVariation(aEncaisserActuel, aEncaisserPrecedent),
    },
    enRetard: {
      montant: enRetardActuel,
      nbFactures: Number(etatActuel?.nb_en_retard || 0),
      variation: calculVariation(enRetardActuel, enRetardPrecedent),
    },
    encaisse: {
      montant: ceMois,
      variation: calculVariation(ceMois, moisPrecedent),
    },
    recouvrement: {
      taux: tauxActuel,
      variation: tauxActuel !== null && tauxPrecedent !== null ? tauxActuel - tauxPrecedent : null,
    },
    statuts: Array.isArray(st) ? st : [],
    creances: Array.isArray(creances) ? creances : [],
  };
};