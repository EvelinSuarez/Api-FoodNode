'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Buscamos el ID real del rol 'Administrador'
    const [roles] = await queryInterface.sequelize.query(
      "SELECT idRole FROM roles WHERE roleName = 'Administrador' LIMIT 1"
    );

    if (roles.length === 0) {
      console.log('⚠️ No se encontró el rol Administrador. Saltando seeder.');
      return;
    }
    const adminRoleId = roles[0].idRole;

    // 2. Buscamos todos los IDs de privilegios existentes
    const [privileges] = await queryInterface.sequelize.query(
      "SELECT idPrivilege FROM privileges"
    );

    // 3. Buscamos qué asociaciones ya existen para no duplicar
    const [existingAssoc] = await queryInterface.sequelize.query(
      `SELECT idPrivilege FROM rolePrivileges WHERE idRole = ${adminRoleId}`
    );
    const existingPrivIds = existingAssoc.map(a => a.idPrivilege);

    // 4. Filtramos e insertamos solo lo que falte
    const dataToInsert = privileges
      .filter(p => !existingPrivIds.includes(p.idPrivilege))
      .map(p => ({
        idRole: adminRoleId,
        idPrivilege: p.idPrivilege
        // No hay timestamps porque tu modelo tiene timestamps: false
      }));

    if (dataToInsert.length > 0) {
      await queryInterface.bulkInsert('rolePrivileges', dataToInsert, {});
      console.log(`✅ Se asignaron ${dataToInsert.length} privilegios nuevos al Administrador.`);
    } else {
      console.log('🔸 El Administrador ya tiene todos los privilegios asignados.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rolePrivileges', null, {});
  }
};