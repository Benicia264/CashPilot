import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Solde from '../models/soldeModel.js';
import MouvementPrevu from '../models/mouvementPrevuModel.js';
import FactureStatut from '../models/factureStatutModel.js';

// La date du jour selon la BASE (cohérente avec les statuts calculés par les vues)
export const dateDuJour = async () => {
  const [ligne] = await sequelize.query('SELECT CURRENT_DATE::text AS date', {
    type: QueryTypes.SELECT,
  });
  return ligne.date;
};

export const dernierSolde = (entrepriseId) =>
  Solde.findOne({
    where: { entrepriseId },
    order: [['dateSolde', 'DESC'], ['id', 'DESC']],
  });

export const creerSolde = (donnees) => Solde.create(donnees);

export const facturesAEncaisser = (entrepriseId) =>
  FactureStatut.findAll({
    where: { entrepriseId, statut: { [Op.in]: ['en_attente', 'en_retard'] } },
  });

export const trouverMouvements = (entrepriseId) =>
  MouvementPrevu.findAll({ where: { entrepriseId }, order: [['datePrevue', 'ASC']] });

export const trouverMouvementParId = (id, entrepriseId) =>
  MouvementPrevu.findOne({ where: { id, entrepriseId } });

export const creerMouvement = (donnees) => MouvementPrevu.create(donnees);

export const supprimerMouvement = (mouvement) => mouvement.destroy();