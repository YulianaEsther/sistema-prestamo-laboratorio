const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' }
}, { tableName: 'users' });

const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false },
  condition: {
    type: DataTypes.ENUM('operativo', 'mantenimiento', 'danado'),
    allowNull: false,
    defaultValue: 'operativo'
  }
}, { tableName: 'equipment' });

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  equipmentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'equipment_id'
  },
  borrowerName: { type: DataTypes.STRING(160), allowNull: false, field: 'borrower_name' },
  loanDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'loan_date' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
  returnedAt: { type: DataTypes.DATE, allowNull: true, field: 'returned_at' },
  responsibleUserId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'responsible_user_id'
  },
  activeEquipmentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    unique: true,
    field: 'active_equipment_id'
  }
}, { tableName: 'loans' });

Equipment.hasMany(Loan, { foreignKey: 'equipmentId', as: 'loans' });
Loan.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
User.hasMany(Loan, { foreignKey: 'responsibleUserId', as: 'registeredLoans' });
Loan.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsibleUser' });

module.exports = { sequelize, User, Equipment, Loan };
