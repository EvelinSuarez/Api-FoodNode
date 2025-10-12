'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { roleName: 'Administrador', status: true },
      { roleName: 'Jefe de cocina', status: true },
      { roleName: 'Cocinero', status: true }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
