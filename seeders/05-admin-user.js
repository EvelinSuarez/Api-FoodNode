'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1015071Ds*', salt);

    await queryInterface.bulkInsert('users', [{
      idUser: 1, // Corregido a idUser por consistencia
      document_type: 'CC',
      document: '123456789',
      cellphone: '3001234567',
      full_name: 'Lina Marcela Rendon',
      email: 'admin@gmail.com',
      password: hashedPassword,
      idRole: 1,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};