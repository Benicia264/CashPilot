import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';
import { demarrerJobRelances } from './jobs/relanceJob.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET manquant ou trop court (32 caractères minimum) dans .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  console.log('Connexion PostgreSQL OK');
  app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  demarrerJobRelances();
} catch (e) {
  console.error('Connexion impossible :', e.message);
}