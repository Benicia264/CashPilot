import express from 'express';
import cors from 'cors';
import entrepriseTemp from './middlewares/entrepriseTemp.js';
import errorHandler from './middlewares/errorHandler.js';
import clientRoute from './routes/clientRoute.js';
import factureRoute from './routes/factureRoute.js';
import paiementRoute from './routes/paiementRoute.js';
import assistantRoute from './routes/assistantRoute.js';
import tresorieRoute from './routes/tresorieRoute.js';
import relanceRoute from './routes/relanceRoute.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));

app.use('/api/clients', entrepriseTemp, clientRoute);
app.use('/api/factures/:factureId/paiements', entrepriseTemp, paiementRoute); // le plus précis d'abord
app.use('/api/factures', entrepriseTemp, factureRoute);
app.use('/api/assistant', entrepriseTemp, assistantRoute);
app.use('/api/tresorerie', entrepriseTemp, tresorieRoute);
app.use('/api/relances', entrepriseTemp, relanceRoute);
app.use(errorHandler); // toujours en dernier

export default app;