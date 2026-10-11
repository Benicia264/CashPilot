import cron from 'node-cron';
import * as relanceService from '../services/relanceService.js';

export const demarrerJobRelances = () => {
  // '0 8 * * *' = minute 0, heure 8, tous les jours
  cron.schedule(
    '0 8 * * *',
    async () => {
      console.log('[relances] Traitement quotidien lancé');
      try {
        const total = await relanceService.executerPourToutes();
        console.log('[relances] Terminé :', total);
      } catch (e) {
        console.error('[relances] Erreur :', e.message);
      }
    },
    { timezone: 'Africa/Brazzaville' }
  );
  console.log('[relances] Tâche quotidienne planifiée (tous les jours à 08:00)');
};