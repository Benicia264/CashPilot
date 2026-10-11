import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MouvementPrevu = sequelize.define(
  'MouvementPrevu',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'entreprise_id' },
    libelle: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'Le libellé est obligatoire' } },
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: { args: [['recette', 'depense']], msg: 'Type invalide (recette ou depense)' } },
    },
    montant: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { min: { args: [0.01], msg: 'Le montant doit être positif' } },
    },
    datePrevue: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_prevue',
      validate: { isDate: { msg: 'Date prévue invalide' } },
    },
    recurrence: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'aucune',
      validate: {
        isIn: {
          args: [['aucune', 'hebdo', 'mensuelle', 'annuelle']],
          msg: 'Récurrence invalide (aucune, hebdo, mensuelle, annuelle)',
        },
      },
    },
  },
  { tableName: 'mouvements_prevus', timestamps: false }
);

export default MouvementPrevu;