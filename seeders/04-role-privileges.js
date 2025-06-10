'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asignar TODOS los privilegios (del 1 al 78) al Rol de Administrador (idRole = 1)
    const rolePrivilegesData = [];
    const totalPrivileges = 78; // El número total de privilegios que creaste

    for (let i = 1; i <= totalPrivileges; i++) {
      rolePrivilegesData.push({
        idRole: 1, // ID del rol de Administrador
        idPrivilege: i,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    if (rolePrivilegesData.length > 0) {
      await queryInterface.bulkInsert('rolePrivileges', rolePrivilegesData, {});
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rolePrivileges', { idRole: 1 }, {});
  }
};