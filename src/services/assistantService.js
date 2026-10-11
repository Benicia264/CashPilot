import * as repo from '../repositories/assistantRepository.js';

const DEVISE = 'FCFA'; // à rendre dynamique plus tard (entreprises.devise)

const montant = (v) => `${Number(v).toLocaleString('fr-FR')} ${DEVISE}`;
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

// minuscules, sans accents, apostrophes simplifiées
const normaliser = (texte) =>
  texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’`]/g, "'");

const intentions = [
  {
    id: 'top_debiteurs',
    exemple: "Qui me doit le plus d'argent ?",
    mots: ['qui me doit', 'me doit le plus', 'doit le plus', 'debiteur', 'creance'],
    run: async (eid) => {
      const donnees = await repo.topDebiteurs(eid);
      if (!donnees.length) {
        return { reponse: "Aucun client ne vous doit d'argent pour le moment.", donnees };
      }
      const lignes = donnees.map(
        (c, i) =>
          `${i + 1}. ${c.nom} : ${montant(c.total_du)} (${pluriel(Number(c.nb_factures), 'facture')})`
      );
      return { reponse: 'Clients qui vous doivent le plus :\n' + lignes.join('\n'), donnees };
    },
  },
  {
    id: 'total_impayes',
    exemple: 'Quel est le montant total de mes factures impayées ?',
    mots: ['montant total', 'total', 'somme'],
    run: async (eid) => {
      const [r] = await repo.totalCreances(eid);
      const nb = Number(r.nb_factures);
      if (nb === 0) return { reponse: 'Aucune facture impayée : tout est encaissé 🎉', donnees: r };
      return {
        reponse: `Il vous reste ${montant(r.total)} à encaisser sur ${pluriel(nb, 'facture')}, dont ${montant(r.en_retard)} déjà en retard.`,
        donnees: r,
      };
    },
  },
  {
    id: 'factures_en_retard',
    exemple: 'Quelles factures sont en retard de paiement ?',
    mots: ['en retard', 'retard', 'echeance depassee'],
    run: async (eid) => {
      const donnees = await repo.facturesEnRetard(eid, 20);
      if (!donnees.length) return { reponse: 'Aucune facture en retard 🎉', donnees };
      const lignes = donnees.map(
        (f) =>
          `${f.numero} (${f.client}) : ${montant(f.reste_a_payer)}, ${pluriel(Number(f.jours_retard), 'jour')} de retard`
      );
      return {
        reponse: 'Factures en retard, des plus anciennes aux plus récentes :\n' + lignes.join('\n'),
        donnees,
      };
    },
  },
  {
    id: 'anciennete_retards',
    exemple: 'Depuis combien de temps ces factures sont-elles impayées ?',
    mots: ['depuis combien', 'combien de temps', 'anciennete', 'depuis quand', 'traine'],
    run: async (eid) => {
      const tranches = await repo.tranchesRetard(eid);
      if (!tranches.length) return { reponse: 'Aucune facture en retard 🎉', donnees: [] };
      const anciennes = await repo.facturesEnRetard(eid, 3);
      const l1 = tranches.map(
        (t) => `- ${t.tranche} : ${pluriel(Number(t.nb_factures), 'facture')} (${montant(t.total)})`
      );
      const l2 = anciennes.map(
        (f) => `${f.numero} (${f.client}) : ${pluriel(Number(f.jours_retard), 'jour')} de retard`
      );
      return {
        reponse:
          'Ancienneté des factures en retard :\n' + l1.join('\n') +
          '\n\nLes plus anciennes :\n' + l2.join('\n'),
        donnees: { tranches, anciennes },
      };
    },
  },
  {
    id: 'encaissements_mois',
    exemple: "Combien d'argent dois-je encaisser ce mois-ci ?",
    mots: ['ce mois', 'mois-ci', 'encaisser', 'a recevoir'],
    run: async (eid) => {
      const [m] = await repo.encaissementsMois(eid);
      const [r] = await repo.recuCeMois(eid);
      return {
        reponse:
          'Ce mois-ci :\n' +
          `- À encaisser (échéances du mois) : ${montant(m.attendu_ce_mois)}\n` +
          `- Déjà reçu ce mois : ${montant(r.recu_ce_mois)}\n` +
          `- En plus, retards des mois précédents encore dus : ${montant(m.retards_anterieurs)}`,
        donnees: { ...m, ...r },
      };
    },
  },
  {
    id: 'statut_clients',
    exemple: "Quels clients ont payé et lesquels n'ont pas encore payé ?",
    mots: ['ont paye', 'paye et', "n'ont pas", 'pas encore paye', 'clients ont', 'partiellement'],
    run: async (eid) => {
      const donnees = await repo.statutParClient(eid);
      if (!donnees.length) return { reponse: 'Aucune facture enregistrée pour le moment.', donnees };
      const lignes = donnees.map(
        (c) =>
          `${c.nom} : ${c.payees} payée(s), ${c.partielles} partielle(s), ${c.impayees} impayée(s)` +
          (Number(c.reste) > 0 ? ` — reste ${montant(c.reste)}` : ' — à jour ✅')
      );
      return { reponse: 'Situation des clients :\n' + lignes.join('\n'), donnees };
    },
  },
];

// Choisit l'intention qui a le plus de mots-clés dans la question.
// C'est CETTE fonction que Claude remplacera plus tard.
const detecterIntention = (question) => {
  const q = normaliser(question);
  let meilleure = null;
  let meilleurScore = 0;
  for (const intention of intentions) {
    const score = intention.mots.filter((mot) => q.includes(mot)).length;
    if (score > meilleurScore) {
      meilleure = intention;
      meilleurScore = score;
    }
  }
  return meilleure;
};

export const repondre = async (question, entrepriseId) => {
  const intention = detecterIntention(question);
  if (!intention) {
    return {
      intention: null,
      reponse:
        "Je n'ai pas compris cette question. Voici ce que je sais faire :\n" +
        intentions.map((i) => `- ${i.exemple}`).join('\n'),
    };
  }
  const resultat = await intention.run(entrepriseId);
  return { intention: intention.id, ...resultat };
};

// Pour afficher des boutons de questions dans le futur frontend
export const listerQuestions = () =>
  intentions.map(({ id, exemple }) => ({ id, question: exemple }));