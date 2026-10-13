import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Entreprise = sequelize.define(
  'Entreprise',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notNull: { msg: "Le nom de l'entreprise est obligatoire" },
        notEmpty: { msg: "Le nom de l'entreprise est obligatoire" },
        len: { args: [1, 150], msg: 'Nom trop long (150 caractères maximum)' },
      },
    },
    devise: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'XAF' },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  },
  { tableName: 'entreprises', timestamps: false }
);

export default Entreprise;