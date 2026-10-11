import Entreprise from '../models/entrepriseModel.js';

export const creer = (donnees, transaction) => Entreprise.create(donnees, { transaction });

export const trouverParId = (id) => Entreprise.findByPk(id);