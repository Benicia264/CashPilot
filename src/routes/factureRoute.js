import { Router } from 'express';
import * as factureController from '../controllers/factureController.js';

const router = Router();

router.get('/', factureController.lister);
router.get('/:id', factureController.obtenir);
router.post('/', factureController.creer);
router.put('/:id', factureController.modifier);
router.patch('/:id/annuler', factureController.annuler);

export default router;