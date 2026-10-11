import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';
import { demarrerJobRelances } from './jobs/relanceJob.js';

const PORT = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  console.log('Connexion PostgreSQL OK');
  app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  demarrerJobRelances();
} catch (e) {
  console.error('Connexion impossible :', e.message);
}