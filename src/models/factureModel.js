import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Facture = sequelize.define(
  'Facture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'entreprise_id' },
    clientId: { type: DataTypes.INTEGER, allowNull: false, field: 'client_id' },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: { msg: 'Le numéro est obligatoire' } },
    },
    montant: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { min: { args: [0.01], msg: 'Le montant doit être positif' } },
    },
    dateEmission: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_emission',
      validate: { isDate: { msg: "Date d'émission invalide" } },
    },
    dateEcheance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_echeance',
      validate: { isDate: { msg: "Date d'échéance invalide" } },
    },
    annulee: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  },
  { tableName: 'factures', timestamps: false }
);

export default Facture;