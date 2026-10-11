import { Router } from 'express';
import * as assistantController from '../controllers/assistantController.js';

const router = Router();

router.get('/questions', assistantController.questions);
router.post('/', assistantController.poser);

export default router;