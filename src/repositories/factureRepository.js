import Facture from '../models/factureModel.js';
import FactureStatut from '../models/factureStatutModel.js';

export const trouverTous = (entrepriseId, statut) => {
  const where = { entrepriseId };
  if (statut) where.statut = statut;
  return FactureStatut.findAll({ where, order: [['dateEcheance', 'ASC']] });
};

export const trouverStatutParId = (id, entrepriseId, transaction) =>
  FactureStatut.findOne({ where: { id, entrepriseId }, transaction });

export const trouverParId = (id, entrepriseId) =>
  Facture.findOne({ where: { id, entrepriseId } });

// Charge la facture ET la verrouille jusqu'à la fin de la transaction
export const verrouillerParId = (id, entrepriseId, transaction) =>
  Facture.findOne({
    where: { id, entrepriseId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

export const creer = (donnees) => Facture.create(donnees);

export const modifier = (facture, donnees) => facture.update(donnees);