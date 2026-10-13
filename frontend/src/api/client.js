const CLE_JETON = 'cashpilot_jeton';

export const lireJeton = () => localStorage.getItem(CLE_JETON);
export const enregistrerJeton = (jeton) => localStorage.setItem(CLE_JETON, jeton);
export const effacerJeton = () => localStorage.removeItem(CLE_JETON);

// Appelée quand le serveur répond 401 avec un jeton : session expirée
let surNonAuthentifie = () => {};
export const definirSurNonAuthentifie = (fonction) => {
  surNonAuthentifie = fonction;
};

export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message);
    this.statut = statut;
  }
}

// Point d'entrée unique pour parler au backend
export const api = async (chemin, { methode = 'GET', corps } = {}) => {
  const entetes = {};
  const jeton = lireJeton();
  if (jeton) entetes.Authorization = `Bearer ${jeton}`;
  if (corps !== undefined) entetes['Content-Type'] = 'application/json';

  let reponse;
  try {
    reponse = await fetch(`/api${chemin}`, {
      method: methode,
      headers: entetes,
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
    });
  } catch {
    throw new ErreurApi('Impossible de joindre le serveur. Vérifiez votre connexion.', 0);
  }

  if (reponse.status === 204) return null;
  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    const brut = donnees?.erreur;
    const message = Array.isArray(brut) ? brut.join(', ') : brut || 'Une erreur est survenue';
    if (reponse.status === 401 && jeton) surNonAuthentifie();
    throw new ErreurApi(message, reponse.status);
  }
  return donnees;
};