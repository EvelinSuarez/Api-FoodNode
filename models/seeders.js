const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1015Dsuarez', salt);

    await queryInterface.bulkInsert('users', [{
      document_type: 'CC',
      document: '123456789',
      cellphone: '3001234567',
      full_name: 'Super Administrador',
      email: 'superadmin@tuapp.com',
      password: hashedPassword,
      idRole: 1,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'superadmin@tuapp.com' }, {});
  }
};
