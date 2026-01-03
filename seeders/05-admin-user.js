'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = 'foodinproduction20@gmail.com';
    const adminDocument = '123456789';

    // 1. Verificar si el usuario ya existe por email o documento
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT idUser FROM users WHERE email = '${adminEmail}' OR document = '${adminDocument}' LIMIT 1`
    );

    if (existingUsers.length > 0) {
      console.log('🔸 El usuario administrador ya existe. Saltando seeder.');
      return;
    }

    // 2. Buscar el ID real del rol Administrador (para no asumir que es 1)
    const [roles] = await queryInterface.sequelize.query(
      "SELECT idRole FROM roles WHERE roleName = 'Administrador' LIMIT 1"
    );

    if (roles.length === 0) {
      console.error('❌ No se puede crear el usuario: El rol Administrador no existe.');
      return;
    }

    const adminRoleId = roles[0].idRole;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1015071Ds*', salt);

    // 3. Insertar
    await queryInterface.bulkInsert('users', [{
      document_type: 'CC',
      document: adminDocument,
      cellphone: '3001234567',
      full_name: 'Lina Marcela Rendon',
      email: adminEmail,
      password: hashedPassword,
      idRole: adminRoleId,
      status: true
    }], {});

    console.log('✅ Usuario administrador creado exitosamente.');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'foodinproduction20@gmail.com' }, {});
  }
};