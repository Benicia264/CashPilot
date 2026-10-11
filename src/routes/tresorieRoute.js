import { Router } from 'express';
import * as tresorerieController from '../controllers/tresorieController.js';

const router = Router();

router.get('/projection', tresorerieController.projection);

router.get('/solde', tresorerieController.obtenirSolde);
router.post('/solde', tresorerieController.enregistrerSolde);

router.get('/mouvements', tresorerieController.listerMouvements);
router.post('/mouvements', tresorerieController.creerMouvement);
router.delete('/mouvements/:id', tresorerieController.supprimerMouvement);

export default router;