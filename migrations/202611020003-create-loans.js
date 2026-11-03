'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loans', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      equipment_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'equipment', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      borrower_name: { type: Sequelize.STRING(160), allowNull: false },
      loan_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      returned_at: { type: Sequelize.DATE, allowNull: true },
      responsible_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      active_equipment_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        unique: true,
        comment: 'NULL al devolver; índice único impide dos préstamos activos del mismo equipo.'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('loans', ['equipment_id', 'loan_date'], { name: 'loans_equipment_history_idx' });
    await queryInterface.addIndex('loans', ['returned_at', 'due_date'], { name: 'loans_active_due_date_idx' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('loans');
  }
};
