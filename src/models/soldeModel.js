import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Solde = sequelize.define(
  'Solde',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'entreprise_id' },
    montant: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { isDecimal: { msg: 'Montant invalide' } },
    },
    dateSolde: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_solde',
      defaultValue: DataTypes.NOW,
      validate: { isDate: { msg: 'Date du solde invalide' } },
    },
  },
  { tableName: 'soldes', timestamps: false }
);

export default Solde;