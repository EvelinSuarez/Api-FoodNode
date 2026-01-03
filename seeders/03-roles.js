'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const rolesToEnsure = [
      { roleName: 'Administrador', status: true },
      { roleName: 'Jefe de cocina', status: true },
      { roleName: 'Cocinero', status: true }
    ];

    try {
      const [existingRoles] = await queryInterface.sequelize.query('SELECT roleName FROM roles');
      const existingRoleNames = existingRoles.map(r => r.roleName);

      const newRoles = rolesToEnsure
        .filter(r => !existingRoleNames.includes(r.roleName))
        .map(r => ({
          ...r,
          createdAt: new Date(), // Requerido por la DB
          updatedAt: new Date()  // Requerido por la DB
        }));

      if (newRoles.length > 0) {
        await queryInterface.bulkInsert('roles', newRoles, {});
        console.log(`✅ Roles insertados exitosamente.`);
      } else {
        console.log('🔸 Los roles ya existen.');
      }
    } catch (error) {
      console.error('⚠️ Error al sembrar roles:', error.message);
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};