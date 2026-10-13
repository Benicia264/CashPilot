import { Router } from 'express';
import * as paiementController from '../controllers/paiementController.js';

// mergeParams : permet de lire :factureId défini dans app.js
const router = Router({ mergeParams: true });

router.get('/', paiementController.lister);
router.post('/', paiementController.creer);

export default router;