import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  api,
  lireJeton,
  enregistrerJeton,
  effacerJeton,
  definirSurNonAuthentifie,
} from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  // On attend la vérification du jeton avant d'afficher quoi que ce soit
  const [chargement, setChargement] = useState(Boolean(lireJeton()));

  const deconnecter = useCallback(() => {
    effacerJeton();
    setUtilisateur(null);
  }, []);

  useEffect(() => {
    definirSurNonAuthentifie(deconnecter);
    if (!lireJeton()) return;
    api('/auth/moi')
      .then(setUtilisateur)
      .catch(deconnecter)
      .finally(() => setChargement(false));
  }, [deconnecter]);

  const ouvrirSession = async ({ jeton }) => {
    enregistrerJeton(jeton);
    setUtilisateur(await api('/auth/moi'));
  };

  const connecter = async (email, motDePasse) => {
    const reponse = await api('/auth/connexion', {
      methode: 'POST',
      corps: { email, motDePasse },
    });
    await ouvrirSession(reponse);
  };

  const inscrire = async (donnees) => {
    const reponse = await api('/auth/inscription', { methode: 'POST', corps: donnees });
    await ouvrirSession(reponse);
  };

  const valeur = {
    utilisateur,
    chargement,
    connecter,
    inscrire,
    deconnecter,
    estProprietaire: utilisateur?.role === 'proprietaire',
    peutModifier: utilisateur?.role !== 'lecteur',
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);