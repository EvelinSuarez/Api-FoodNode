'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asignar TODOS los privilegios al Rol de Administrador (idRole = 1)
    const [privileges] = await queryInterface.sequelize.query('SELECT idPrivilege FROM privileges');
    
    if (privileges && privileges.length > 0) {
      const rolePrivilegesData = privileges.map(privilege => ({
        idRole: 1, // ID del rol de Administrador
        idPrivilege: privilege.idPrivilege,
        // createdAt y updatedAt serán manejados por Sequelize
      }));
      await queryInterface.bulkInsert('rolePrivileges', rolePrivilegesData, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina todas las asignaciones para el rol 1
    await queryInterface.bulkDelete('rolePrivileges', { idRole: 1 }, {});
  }
};