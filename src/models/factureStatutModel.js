import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle en LECTURE SEULE : il décrit la vue v_factures_statut
const FactureStatut = sequelize.define(
  'FactureStatut',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    entrepriseId: { type: DataTypes.INTEGER, field: 'entreprise_id' },
    clientId: { type: DataTypes.INTEGER, field: 'client_id' },
    numero: { type: DataTypes.STRING },
    montant: { type: DataTypes.DECIMAL(14, 2) },
    dateEcheance: { type: DataTypes.DATEONLY, field: 'date_echeance' },
    montantPaye: { type: DataTypes.DECIMAL(14, 2), field: 'montant_paye' },
    resteAPayer: { type: DataTypes.DECIMAL(14, 2), field: 'reste_a_payer' },
    statut: { type: DataTypes.STRING },
    joursRetard: { type: DataTypes.INTEGER, field: 'jours_retard' },
  },
  { tableName: 'v_factures_statut', timestamps: false }
);

export default FactureStatut;