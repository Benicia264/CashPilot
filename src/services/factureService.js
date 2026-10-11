import * as factureRepository from '../repositories/factureRepository.js';
import * as clientRepository from '../repositories/clientRepository.js';

const CHAMPS_CREATION = ['clientId', 'numero', 'montant', 'dateEmission', 'dateEcheance'];
const CHAMPS_MODIFICATION = ['numero', 'montant', 'dateEmission', 'dateEcheance'];
const STATUTS = ['en_attente', 'en_retard', 'payee', 'annulee'];

const filtrer = (corps, champs) =>
  Object.fromEntries(Object.entries(corps).filter(([cle]) => champs.includes(cle)));

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

const aujourdhui = () => new Date().toISOString().slice(0, 10);

const verifierDates = (emission, echeance) => {
  if (echeance < emission) {
    throw erreur("L'échéance ne peut pas précéder l'émission", 400);
  }
};

export const lister = (entrepriseId, statut) => {
  if (statut && !STATUTS.includes(statut)) {
    throw erreur(`Statut invalide (${STATUTS.join(', ')})`, 400);
  }
  return factureRepository.trouverTous(entrepriseId, statut);
};

export const obtenir = async (id, entrepriseId) => {
  const facture = await factureRepository.trouverStatutParId(id, entrepriseId);
  if (!facture) throw erreur('Facture introuvable', 404);
  return facture;
};

export const creer = async (corps, entrepriseId) => {
  const donnees = filtrer(corps, CHAMPS_CREATION);
  donnees.dateEmission ??= aujourdhui();

  if (!donnees.clientId) throw erreur('clientId obligatoire', 400);
  const client = await clientRepository.trouverParId(donnees.clientId, entrepriseId);
  if (!client) throw erreur('Client introuvable', 404);

  verifierDates(donnees.dateEmission, donnees.dateEcheance);

  const facture = await factureRepository.creer({ ...donnees, entrepriseId });
  return factureRepository.trouverStatutParId(facture.id, entrepriseId);
};

export const modifier = async (id, corps, entrepriseId) => {
  const statut = await obtenir(id, entrepriseId);
  if (statut.statut === 'annulee') {
    throw erreur('Facture annulée : modification impossible', 409);
  }

  const facture = await factureRepository.trouverParId(id, entrepriseId);
  const donnees = filtrer(corps, CHAMPS_MODIFICATION);

  verifierDates(
    donnees.dateEmission ?? facture.dateEmission,
    donnees.dateEcheance ?? facture.dateEcheance
  );

  if (donnees.montant !== undefined && Number(donnees.montant) < Number(statut.montantPaye)) {
    throw erreur(
      `Le montant ne peut pas être inférieur au montant déjà payé (${statut.montantPaye})`,
      409
    );
  }

  await factureRepository.modifier(facture, donnees);
  return factureRepository.trouverStatutParId(id, entrepriseId);
};

export const annuler = async (id, entrepriseId) => {
  const statut = await obtenir(id, entrepriseId);
  if (statut.statut === 'annulee') throw erreur('Facture déjà annulée', 409);
  if (Number(statut.montantPaye) > 0) {
    throw erreur('Des paiements existent : annulation impossible', 409);
  }

  const facture = await factureRepository.trouverParId(id, entrepriseId);
  await factureRepository.modifier(facture, { annulee: true });
  return factureRepository.trouverStatutParId(id, entrepriseId);
};