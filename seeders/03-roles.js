'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { idRole: 1, roleName: 'Administrador', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 2, roleName: 'Jefe de cocina', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 3, roleName: 'Cocinero', status: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};