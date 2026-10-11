import jwt from 'jsonwebtoken';
import sequelize from '../config/db.js';
import * as userRepository from '../repositories/userRepository.js';
import * as entrepriseRepository from '../repositories/entrepriseRepository.js';
import { profil } from './userService.js';
import {
  normaliserEmail,
  verifierFormatMotDePasse,
  hacher,
  comparer,
  FAUX_HASH,
} from '../utils/securite.js';

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

// Le jeton ne contient que l'id : le reste est relu en base à chaque requête
const fabriquerJeton = (user) =>
  jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '8h',
  });

// Crée l'entreprise ET son propriétaire, ou rien du tout (transaction)
export const inscrire = async (corps = {}) => {
  const { entrepriseNom, nom, email, motDePasse } = corps;

  if (typeof entrepriseNom !== 'string' || !entrepriseNom.trim()) {
    throw erreur("Le nom de l'entreprise est obligatoire", 400);
  }
  verifierFormatMotDePasse(motDePasse);
  const hash = await hacher(motDePasse);

  try {
    const user = await sequelize.transaction(async (t) => {
      const entreprise = await entrepriseRepository.creer({ nom: entrepriseNom.trim() }, t);
      return userRepository.creer(
        {
          entrepriseId: entreprise.id,
          nom,
          email: normaliserEmail(email),
          motDePasseHash: hash,
          role: 'proprietaire',
        },
        t
      );
    });
    return { jeton: fabriquerJeton(user), utilisateur: profil(user) };
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw erreur('Un compte existe déjà avec cet email', 409);
    }
    throw e;
  }
};

export const connecter = async (corps = {}) => {
  const user = await userRepository.trouverParEmail(normaliserEmail(corps.email));

  // Même travail que l'email existe ou non, et même message d'erreur dans tous les cas
  const hash = user?.motDePasseHash ?? FAUX_HASH;
  const motDePasseOk = typeof corps.motDePasse === 'string' && (await comparer(corps.motDePasse, hash));

  if (!user || !motDePasseOk || !user.actif) {
    throw erreur('Email ou mot de passe incorrect', 401);
  }
  return { jeton: fabriquerJeton(user), utilisateur: profil(user) };
};

export const moi = async (userId) => {
  const user = await userRepository.trouverParId(userId);
  const entreprise = await entrepriseRepository.trouverParId(user.entrepriseId);
  return {
    ...profil(user),
    entreprise: { id: entreprise.id, nom: entreprise.nom, devise: entreprise.devise },
  };
};