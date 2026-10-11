import Client from '../models/clientModel.js';

export const trouverTous = (entrepriseId) =>
  Client.findAll({ where: { entrepriseId }, order: [['nom', 'ASC']] });

export const trouverParId = (id, entrepriseId) =>
  Client.findOne({ where: { id, entrepriseId } });

export const creer = (donnees) => Client.create(donnees);

export const modifier = (client, donnees) => client.update(donnees);

export const supprimer = (client) => client.destroy();