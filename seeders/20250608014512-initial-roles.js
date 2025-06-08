'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Inserta los roles iniciales en la base de datos.
     */
    await queryInterface.bulkInsert('roles', [
      {
        idRole: 1,
        roleName: 'Administrador',
        status: true,
      },
      {
        idRole: 2,
        roleName: 'Jefe de cocina',
        status: true,
      },
      {
        idRole: 3,
        roleName: 'Cociner',
        status: true,
      }
      
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // Esto eliminará todos los roles, lo cual es seguro para un seeder inicial.
    await queryInterface.bulkDelete('roles', null, {});
  }
};