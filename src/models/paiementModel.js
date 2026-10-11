import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Paiement = sequelize.define(
  'Paiement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    factureId: { type: DataTypes.INTEGER, allowNull: false, field: 'facture_id' },
    montant: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { min: { args: [0.01], msg: 'Le montant doit être positif' } },
    },
    datePaiement: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_paiement',
      defaultValue: DataTypes.NOW,
      validate: { isDate: { msg: 'Date de paiement invalide' } },
    },
    mode: { type: DataTypes.STRING(20), defaultValue: 'especes' },
  },
  { tableName: 'paiements', timestamps: false }
);

export default Paiement;