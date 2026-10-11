import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/', userController.lister);
router.post('/', userController.creer);
router.patch('/:id', userController.modifier);

export default router;