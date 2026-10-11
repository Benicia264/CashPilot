import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Client = sequelize.define(
  'Client',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entreprise_id',
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'Le nom est obligatoire' } },
    },
    email: {
      type: DataTypes.STRING(150),
      validate: { isEmail: { msg: 'Email invalide' } },
    },
    telephone: { type: DataTypes.STRING(30) },
    canalPrefere: {
      type: DataTypes.STRING(10),
      defaultValue: 'email',
      field: 'canal_prefere',
      validate: {
        isIn: {
          args: [['email', 'sms', 'whatsapp']],
          msg: 'Canal invalide (email, sms ou whatsapp)',
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: 'clients', timestamps: false }
);

export default Client;