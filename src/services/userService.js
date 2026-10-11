import * as userRepository from '../repositories/userRepository.js';
import {
  normaliserEmail,
  verifierFormatMotDePasse,
  hacher,
} from '../utils/securite.js';

const CHAMPS_MODIFIABLES = ['nom', 'role', 'actif'];

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

// On ne renvoie jamais l'objet brut : seulement ces champs
export const profil = (u) => ({
  id: u.id,
  nom: u.nom,
  email: u.email,
  role: u.role,
  actif: u.actif,
  entrepriseId: u.entrepriseId,
});

export const lister = async (entrepriseId) =>
  (await userRepository.lister(entrepriseId)).map(profil);

export const creer = async (corps = {}, entrepriseId) => {
  verifierFormatMotDePasse(corps.motDePasse);
  try {
    const user = await userRepository.creer({
      entrepriseId, // toujours celle du propriétaire connecté
      nom: corps.nom,
      email: normaliserEmail(corps.email),
      motDePasseHash: await hacher(corps.motDePasse),
      role: corps.role ?? 'gestionnaire',
    });
    return profil(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw erreur('Un compte existe déjà avec cet email', 409);
    }
    throw e;
  }
};

export const modifier = async (id, corps = {}, acteur) => {
  if (Number(id) === acteur.id) {
    throw erreur('Vous ne pouvez pas modifier votre propre compte ici', 409);
  }
  const user = await userRepository.trouverParIdEtEntreprise(id, acteur.entrepriseId);
  if (!user) throw erreur('Utilisateur introuvable', 404);

  const donnees = Object.fromEntries(
    Object.entries(corps).filter(([cle]) => CHAMPS_MODIFIABLES.includes(cle))
  );
  return profil(await userRepository.modifier(user, donnees));
};