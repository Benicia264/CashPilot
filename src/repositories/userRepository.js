import User from '../models/userModel.js';

// Seule fonction qui charge le hash du mot de passe
export const trouverParEmail = (email) =>
  User.scope('avecMotDePasse').findOne({ where: { email } });

export const trouverParId = (id) => User.findByPk(id);

export const trouverParIdEtEntreprise = (id, entrepriseId) =>
  User.findOne({ where: { id, entrepriseId } });

export const lister = (entrepriseId) =>
  User.findAll({ where: { entrepriseId }, order: [['nom', 'ASC']] });

export const creer = (donnees, transaction) => User.create(donnees, { transaction });

export const modifier = (user, donnees) => user.update(donnees);