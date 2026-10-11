import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import {
  authentifier,
  autoriser,
  restreindreLecteur,
} from './middlewares/authMiddleware.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import clientRoute from './routes/clientRoute.js';
import factureRoute from './routes/factureRoute.js';
import paiementRoute from './routes/paiementRoute.js';
import assistantRoute from './routes/assistantRoute.js';
import tresorerieRoute from './routes/tresorieRoute.js';
import relanceRoute from './routes/relanceRoute.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));

// Connecté + (lecteur = consultation seulement)
const protege = [authentifier, restreindreLecteur];

app.use('/api/auth', authRoute); // inscription et connexion : publiques
app.use('/api/users', authentifier, autoriser('proprietaire'), userRoute);
app.use('/api/clients', protege, clientRoute);
app.use('/api/factures/:factureId/paiements', protege, paiementRoute); // le plus précis d'abord
app.use('/api/factures', protege, factureRoute);
app.use('/api/assistant', authentifier, assistantRoute); // POST autorisé aux lecteurs : ce sont des questions
app.use('/api/tresorerie', protege, tresorerieRoute);
app.use('/api/relances', protege, relanceRoute);

app.use(errorHandler); // toujours en dernier

export default app;