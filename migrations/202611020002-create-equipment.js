'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      code: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(160), allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: false },
      condition: {
        type: Sequelize.ENUM('operativo', 'mantenimiento', 'danado'),
        allowNull: false,
        defaultValue: 'operativo'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('equipment');
  }
};
