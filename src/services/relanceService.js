import * as repo from '../repositories/relanceRepository.js';
import { notifier, contactManquant, lienWhatsApp } from './notificationService.js';

const DEVISE = 'FCFA';
const CHAMPS_REGLE = ['joursRetard', 'message', 'actif'];
const STATUTS = ['a_envoyer', 'envoyee', 'echec'];

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

const filtrer = (corps, champs) =>
  Object.fromEntries(Object.entries(corps).filter(([cle]) => champs.includes(cle)));

const montant = (n) => `${Number(n).toLocaleString('fr-FR')} ${DEVISE}`;

// Remplace {client}, {numero}, {reste}, ... dans le modèle de message
const genererMessage = (modele, d) =>
  modele
    .replaceAll('{client}', d.client_nom)
    .replaceAll('{entreprise}', d.entreprise_nom)
    .replaceAll('{numero}', d.numero)
    .replaceAll('{reste}', montant(d.reste_a_payer))
    .replaceAll('{echeance}', d.date_echeance.split('-').reverse().join('/'))
    .replaceAll('{jours}', String(d.jours_retard));

// ================= Règles =================
const obtenirRegle = async (id, entrepriseId) => {
  const regle = await repo.trouverRegleParId(id, entrepriseId);
  if (!regle) throw erreur('Règle introuvable', 404);
  return regle;
};

export const listerRegles = (entrepriseId) => repo.trouverRegles(entrepriseId);

export const creerRegle = (corps, entrepriseId) =>
  repo.creerRegle({ ...filtrer(corps, CHAMPS_REGLE), entrepriseId });

export const modifierRegle = async (id, corps, entrepriseId) => {
  const regle = await obtenirRegle(id, entrepriseId);
  return repo.modifierRegle(regle, filtrer(corps, CHAMPS_REGLE));
};

export const supprimerRegle = async (id, entrepriseId) => {
  const regle = await obtenirRegle(id, entrepriseId);
  await repo.supprimerRegle(regle);
};

// ================= Moteur =================
export const executer = async (entrepriseId) => {
  const bilan = { envoyees: [], aEnvoyer: [], echecs: [], ignorees: [] };
  const candidats = await repo.relancesADeclencher(entrepriseId);

  for (const c of candidats) {
    const canal = c.canal_prefere;
    const contact = { email: c.email, telephone: c.telephone };

    const manque = contactManquant(contact, canal);
    if (manque) {
      bilan.ignorees.push({ facture: c.numero, client: c.client_nom, raison: manque });
      continue; // pas enregistrée : sera réévaluée à la prochaine exécution
    }

    const message = genererMessage(c.modele, c);

    // 1. On RÉSERVE la relance avant d'envoyer : la contrainte UNIQUE garantit
    //    que deux exécutions simultanées ne peuvent pas envoyer le même message
    let relance;
    try {
      relance = await repo.creerRelance({
        factureId: c.facture_id,
        regleId: c.regle_id,
        canal,
        message,
        statut: 'a_envoyer',
      });
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') continue;
      throw e;
    }

    // 2. On envoie, puis on met à jour le statut
    try {
      const res = await notifier({
        canal,
        client: contact,
        sujet: `Rappel : facture ${c.numero}`,
        message,
      });

      if (res.statut === 'envoyee') {
        await repo.mettreAJourRelance(relance.id, { statut: 'envoyee', envoyeeLe: new Date() });
        bilan.envoyees.push({
          relanceId: relance.id,
          facture: c.numero,
          client: c.client_nom,
          canal,
          ...(res.apercu && { apercu: res.apercu }),
        });
      } else {
        bilan.aEnvoyer.push({
          relanceId: relance.id,
          facture: c.numero,
          client: c.client_nom,
          canal,
          lienWhatsApp: res.lien,
        });
      }
    } catch (e) {
      await repo.mettreAJourRelance(relance.id, { statut: 'echec', erreur: e.message });
      bilan.echecs.push({
        relanceId: relance.id,
        facture: c.numero,
        client: c.client_nom,
        erreur: e.message,
      });
    }
  }

  return bilan;
};

// Utilisé par la tâche quotidienne : toutes les entreprises
export const executerPourToutes = async () => {
  const total = { envoyees: 0, aEnvoyer: 0, echecs: 0, ignorees: 0 };
  for (const id of await repo.entreprisesIds()) {
    try {
      const b = await executer(id);
      total.envoyees += b.envoyees.length;
      total.aEnvoyer += b.aEnvoyer.length;
      total.echecs += b.echecs.length;
      total.ignorees += b.ignorees.length;
    } catch (e) {
      console.error(`[relances] Entreprise ${id} :`, e.message);
    }
  }
  return total;
};

// ================= Historique et suivi =================
export const lister = async (entrepriseId, statut) => {
  if (statut && !STATUTS.includes(statut)) {
    throw erreur(`Statut invalide (${STATUTS.join(', ')})`, 400);
  }
  const lignes = await repo.listerRelances(entrepriseId, statut);
  return lignes.map(({ telephone, ...r }) => ({
    ...r,
    // le lien est recalculé à la demande à partir du message enregistré
    ...(r.canal === 'whatsapp' &&
      r.statut === 'a_envoyer' && { lienWhatsApp: lienWhatsApp(telephone, r.message) }),
  }));
};

const obtenirDetail = async (id, entrepriseId) => {
  const relance = await repo.trouverDetail(id, entrepriseId);
  if (!relance) throw erreur('Relance introuvable', 404);
  return relance;
};

// Le gestionnaire a cliqué sur le lien et envoyé le message WhatsApp
export const marquerEnvoyee = async (id, entrepriseId) => {
  const relance = await obtenirDetail(id, entrepriseId);
  if (relance.statut !== 'a_envoyer') {
    throw erreur(`Relance déjà traitée (statut : ${relance.statut})`, 409);
  }
  await repo.mettreAJourRelance(relance.id, { statut: 'envoyee', envoyeeLe: new Date() });
  return { id: relance.id, statut: 'envoyee' };
};

// Nouvelle tentative pour un envoi en échec
export const renvoyer = async (id, entrepriseId) => {
  const r = await obtenirDetail(id, entrepriseId);
  if (r.statut !== 'echec') {
    throw erreur('Seules les relances en échec peuvent être renvoyées', 409);
  }
  try {
    const res = await notifier({
      canal: r.canal,
      client: { email: r.email, telephone: r.telephone },
      sujet: `Rappel : facture ${r.numero}`,
      message: r.message,
    });
    await repo.mettreAJourRelance(r.id, {
      statut: res.statut,
      erreur: null,
      envoyeeLe: res.statut === 'envoyee' ? new Date() : null,
    });
    return { id: r.id, statut: res.statut, ...(res.apercu && { apercu: res.apercu }) };
  } catch (e) {
    await repo.mettreAJourRelance(r.id, { erreur: e.message });
    throw erreur(`Échec de l'envoi : ${e.message}`, 502);
  }
};