import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Charge une adresse de l'API et recharge quand elle change
export function useApi(chemin) {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(Boolean(chemin));

  const charger = useCallback(async () => {
    if (!chemin) return;
    setChargement(true);
    try {
      setDonnees(await api(chemin));
      setErreur(null);
    } catch (e) {
      setErreur(e);
      setDonnees(null);
    } finally {
      setChargement(false);
    }
  }, [chemin]);

  useEffect(() => {
    charger();
  }, [charger]);

  return { donnees, erreur, chargement, recharger: charger };
}