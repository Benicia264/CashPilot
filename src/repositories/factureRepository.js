import Facture from '../models/factureModel.js';
import FactureStatut from '../models/factureStatutModel.js';

export const trouverTous = (entrepriseId, statut) => {
  const where = { entrepriseId };
  if (statut) where.statut = statut;
  return FactureStatut.findAll({ where, order: [['dateEcheance', 'ASC']] });
};

export const trouverStatutParId = (id, entrepriseId) =>
  FactureStatut.findOne({ where: { id, entrepriseId } });

export const trouverParId = (id, entrepriseId) =>
  Facture.findOne({ where: { id, entrepriseId } });

export const creer = (donnees) => Facture.create(donnees);

export const modifier = (facture, donnees) => facture.update(donnees);