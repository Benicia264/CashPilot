import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';

const erreur = (message, statut) => Object.assign(new Error(message), { statut });

// 1. Vérifie le jeton, charge l'utilisateur, pose req.user et req.entrepriseId
export const authentifier = async (req, res, next) => {
  try {
    const [type, jeton] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !jeton) throw erreur('Authentification requise', 401);

    let charge;
    try {
      charge = jwt.verify(jeton, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      throw erreur('Jeton invalide ou expiré', 401);
    }

    const id = Number(charge.sub);
    if (!Number.isInteger(id)) throw erreur('Jeton invalide', 401);

    const user = await userRepository.trouverParId(id);
    if (!user || !user.actif) throw erreur('Compte introuvable ou désactivé', 401);

    req.user = { id: user.id, role: user.role, entrepriseId: user.entrepriseId };
    req.entrepriseId = user.entrepriseId; // les controllers existants n'ont rien à changer
    next();
  } catch (e) {
    next(e);
  }
};

// 2. Réserve une route à certains rôles : autoriser('proprietaire')
export const autoriser =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(erreur('Accès refusé : droits insuffisants', 403));
    }
    next();
  };

// 3. Un lecteur peut consulter (GET) mais ne peut rien modifier
export const restreindreLecteur = (req, res, next) => {
  const consultation = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (req.user.role === 'lecteur' && !consultation) {
    return next(erreur('Accès refusé : compte en lecture seule', 403));
  }
  next();
};