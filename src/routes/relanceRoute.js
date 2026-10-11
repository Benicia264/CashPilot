import { Router } from 'express';
import * as relanceController from '../controllers/relanceController.js';

const router = Router();

// Règles
router.get('/regles', relanceController.listerRegles);
router.post('/regles', relanceController.creerRegle);
router.put('/regles/:id', relanceController.modifierRegle);
router.delete('/regles/:id', relanceController.supprimerRegle);

// Historique et actions
router.get('/', relanceController.lister);
router.post('/executer', relanceController.executer);
router.patch('/:id/envoyee', relanceController.marquerEnvoyee);
router.patch('/:id/renvoyer', relanceController.renvoyer);

export default router;