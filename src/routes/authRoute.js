import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authentifier } from '../middlewares/authMiddleware.js';

const router = Router();

// Routes publiques
router.post('/inscription', authController.inscrire);
router.post('/connexion', authController.connecter);

// Route protégée
router.get('/moi', authentifier, authController.moi);

export default router;