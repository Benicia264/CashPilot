import sequelize from '../config/db.js';
import * as paiementRepository from '../repositories/paiementRepository.js';
import * as factureRepository from '../repositories/factureRepository.js';
import * as factureService from './factureService.js';

const CHAMPS_AUTORISES = ['montant', 'datePaiement', 'mode'];
const MODES = ['especes', 'virement', 'cheque', 'mobile_money', 'carte'];

const filtrer = (corps) =>
  Object.fromEntries(
    Object.entries(corps).filter(([cle]) => CHAMPS_AUTORISES.includes(cle))
  );

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

// On compare en centimes pour éviter les erreurs d'arrondi des décimaux
const enCentimes = (valeur) => Math.round(Number(valeur) * 100);

export const lister = async (factureId, entrepriseId) => {
  await factureService.obtenir(factureId, entrepriseId); // 404 si la facture n'est pas à nous
  return paiementRepository.trouverParFacture(factureId);
};

export const creer = async (factureId, corps, entrepriseId) => {
  const donnees = filtrer(corps);

  const montant = Number(donnees.montant);
  if (!Number.isFinite(montant) || montant <= 0) {
    throw erreur('Le montant doit être un nombre positif', 400);
  }
  if (donnees.mode && !MODES.includes(donnees.mode)) {
    throw erreur(`Mode invalide (${MODES.join(', ')})`, 400);
  }

  // Tout ce qui est dans ce bloc réussit ensemble, ou est annulé ensemble
  const paiement = await sequelize.transaction(async (t) => {
    const facture = await factureRepository.verrouillerParId(factureId, entrepriseId, t);
    if (!facture) throw erreur('Facture introuvable', 404);
    if (facture.annulee) throw erreur('Facture annulée : paiement impossible', 409);

    const statut = await factureRepository.trouverStatutParId(factureId, entrepriseId, t);
    if (enCentimes(montant) > enCentimes(statut.resteAPayer)) {
      throw erreur(`Paiement trop élevé : reste à payer = ${statut.resteAPayer}`, 409);
    }

    return paiementRepository.creer(
      { ...donnees, montant: enCentimes(montant) / 100, factureId: facture.id },
      t
    );
  });

  const facture = await factureRepository.trouverStatutParId(factureId, entrepriseId);
  return { paiement, facture };
};