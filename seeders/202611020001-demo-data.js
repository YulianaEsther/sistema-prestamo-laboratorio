'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Laboratorio123!', 12);
    await queryInterface.bulkInsert('users', [{
      name: 'Administradora de Prueba',
      email: 'admin@laboratorio.test',
      password_hash: passwordHash,
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('equipment', [
      { code: 'LAB-MIC-001', name: 'Microscopio óptico', category: 'Microscopía', condition: 'operativo', created_at: now, updated_at: now },
      { code: 'LAB-BAL-002', name: 'Balanza digital', category: 'Medición', condition: 'operativo', created_at: now, updated_at: now },
      { code: 'LAB-CEN-003', name: 'Centrífuga de mesa', category: 'Separación', condition: 'mantenimiento', created_at: now, updated_at: now }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('equipment', { code: ['LAB-MIC-001', 'LAB-BAL-002', 'LAB-CEN-003'] });
    await queryInterface.bulkDelete('users', { email: 'admin@laboratorio.test' });
  }
};
