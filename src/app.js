import express from 'express';
import cors from 'cors';
import entrepriseTemp from './middlewares/entrepriseTemp.js';
import errorHandler from './middlewares/errorHandler.js';
import clientRoute from './routes/clientRoute.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));

app.use('/api/clients', entrepriseTemp, clientRoute);

app.use(errorHandler); // toujours en dernier

export default app;