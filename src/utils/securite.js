import bcrypt from 'bcryptjs';

const ROUNDS = 12; // coût du hachage : plus c'est haut, plus c'est lent à attaquer

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

export const normaliserEmail = (email) => String(email ?? '').trim().toLowerCase();

// bcrypt ignore tout ce qui dépasse 72 caractères, d'où cette limite
export const verifierFormatMotDePasse = (motDePasse) => {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8 || motDePasse.length > 72) {
    throw erreur('Le mot de passe doit contenir entre 8 et 72 caractères', 400);
  }
};

export const hacher = (motDePasse) => bcrypt.hash(motDePasse, ROUNDS);
export const comparer = (motDePasse, hash) => bcrypt.compare(motDePasse, hash);

// Hash bidon : sert à faire le même travail quand l'email n'existe pas,
// pour qu'on ne puisse pas deviner quels emails sont inscrits d'après le temps de réponse
export const FAUX_HASH = bcrypt.hashSync('mot-de-passe-factice', ROUNDS);