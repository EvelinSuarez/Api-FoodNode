'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const rolesToEnsure = [
      { roleName: 'Administrador', status: true },
      { roleName: 'Jefe de cocina', status: true },
      { roleName: 'Cocinero', status: true }
    ];

    try {
      // 1. Consultar roles existentes
      const [existingRoles] = await queryInterface.sequelize.query(
        'SELECT roleName FROM roles'
      );
      
      const existingRoleNames = existingRoles.map(r => r.roleName);

      // 2. Filtrar los que no existen
      const newRoles = rolesToEnsure.filter(
        r => !existingRoleNames.includes(r.roleName)
      );

      if (newRoles.length > 0) {
        await queryInterface.bulkInsert('roles', newRoles, {});
        console.log(`✅ Roles insertados: ${newRoles.map(r => r.roleName).join(', ')}`);
      } else {
        console.log('🔸 Todos los roles ya existen en la base de datos.');
      }
    } catch (error) {
      console.error('⚠️ Error al sembrar roles:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};