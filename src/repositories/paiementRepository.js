import Paiement from '../models/paiementModel.js';

export const trouverParFacture = (factureId) =>
  Paiement.findAll({
    where: { factureId },
    order: [['datePaiement', 'DESC'], ['id', 'DESC']],
  });

export const creer = (donnees, transaction) =>
  Paiement.create(donnees, { transaction });