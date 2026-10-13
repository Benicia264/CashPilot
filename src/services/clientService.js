import * as clientRepository from '../repositories/clientRepository.js';

// Seuls ces champs peuvent venir du client HTTP
const CHAMPS_AUTORISES = ['nom', 'email', 'telephone', 'canalPrefere'];

const filtrer = (corps) =>
  Object.fromEntries(
    Object.entries(corps).filter(([cle]) => CHAMPS_AUTORISES.includes(cle))
  );

const erreur = (message, statut) =>
  Object.assign(new Error(message), { statut });

export const lister = (entrepriseId) =>
  clientRepository.trouverTous(entrepriseId);

export const obtenir = async (id, entrepriseId) => {
  const client = await clientRepository.trouverParId(id, entrepriseId);
  if (!client) throw erreur('Client introuvable', 404);
  return client;
};

export const creer = (corps, entrepriseId) =>
  clientRepository.creer({ ...filtrer(corps), entrepriseId });

export const modifier = async (id, corps, entrepriseId) => {
  const client = await obtenir(id, entrepriseId);
  return clientRepository.modifier(client, filtrer(corps));
};

export const supprimer = async (id, entrepriseId) => {
  const client = await obtenir(id, entrepriseId);
  await clientRepository.supprimer(client);
};