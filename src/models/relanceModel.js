import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Relance = sequelize.define(
  'Relance',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    factureId: { type: DataTypes.INTEGER, allowNull: false, field: 'facture_id' },
    regleId: { type: DataTypes.INTEGER, field: 'regle_id' },
    canal: { type: DataTypes.STRING(10), allowNull: false },
    statut: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'a_envoyer',
      validate: { isIn: { args: [['a_envoyer', 'envoyee', 'echec']], msg: 'Statut invalide' } },
    },
    message: { type: DataTypes.TEXT },
    erreur: { type: DataTypes.TEXT },
    envoyeeLe: { type: DataTypes.DATE, field: 'envoyee_le' },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  },
  { tableName: 'relances', timestamps: false }
);

export default Relance;