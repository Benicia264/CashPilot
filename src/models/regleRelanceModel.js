import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RegleRelance = sequelize.define(
  'RegleRelance',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'entreprise_id' },
    joursRetard: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'jours_retard',
      validate: {
        isInt: { msg: 'Le délai doit être un nombre entier de jours' },
        min: { args: [0], msg: 'Le délai ne peut pas être négatif' },
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Le message est obligatoire' } },
    },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'regles_relance', timestamps: false }
);

export default RegleRelance;