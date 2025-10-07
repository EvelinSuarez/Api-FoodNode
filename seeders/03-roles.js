'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { idRole: 1, roleName: 'Administrador', status: true },
      { idRole: 2, roleName: 'Jefe de cocina', status: true },
      { idRole: 3, roleName: 'Cocinero', status: true }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};