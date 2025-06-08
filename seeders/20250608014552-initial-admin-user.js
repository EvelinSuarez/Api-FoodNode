'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1015071Ds*', salt); // Cambia 'admin123' por la contraseña que desees

    await queryInterface.bulkInsert('users', [{
      idUsers: 1,
      document_type: 'CC',
      document: '123456789',
      cellphone: '3001234567',
      full_name: 'Lina Marcela Rendon',
      email: 'admin@gmail.com', // Cambia este email
      password: hashedPassword,
      idRole: 1, // Asignado al rol de Administrador
      status: true
      // createdAt y updatedAt se manejarán si la tabla los tiene
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { idUsers: 1 }, {});
  }
};