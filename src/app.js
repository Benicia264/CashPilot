import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));

export default app;