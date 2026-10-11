import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';

const router = Router();

router.get('/', clientController.lister);
router.get('/:id', clientController.obtenir);
router.post('/', clientController.creer);
router.put('/:id', clientController.modifier);
router.delete('/:id', clientController.supprimer);

export default router;