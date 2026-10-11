import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'entreprise_id' },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notNull: { msg: 'Le nom est obligatoire' },
        notEmpty: { msg: 'Le nom est obligatoire' },
        len: { args: [1, 150], msg: 'Nom trop long (150 caractères maximum)' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notNull: { msg: "L'email est obligatoire" },
        isEmail: { msg: 'Email invalide' },
        len: { args: [1, 150], msg: 'Email trop long (150 caractères maximum)' },
      },
    },
    motDePasseHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'mot_de_passe_hash',
    },
    role: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: 'gestionnaire',
      validate: {
        isIn: {
          args: [['proprietaire', 'gestionnaire', 'lecteur']],
          msg: 'Rôle invalide (proprietaire, gestionnaire ou lecteur)',
        },
      },
    },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'users',
    timestamps: false,
    // Par défaut, le hash du mot de passe n'est JAMAIS chargé
    defaultScope: { attributes: { exclude: ['motDePasseHash'] } },
    // Scope explicite, utilisé uniquement pour la connexion
    scopes: { avecMotDePasse: {} },
  }
);

export default User;