'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissionsToEnsure = [
      { permissionName: 'Dashboard', permissionKey: 'dashboard' },
      { permissionName: 'Roles', permissionKey: 'roles' },
      { permissionName: 'Usuarios', permissionKey: 'usuarios' },
      { permissionName: 'Proveedores', permissionKey: 'proveedores' },
      { permissionName: 'Insumo', permissionKey: 'insumo' },
      { permissionName: 'Producto Insumo', permissionKey: 'producto-insumo' },
      { permissionName: 'Orden de producción', permissionKey: 'orden-produccion' },
      { permissionName: 'Gestión de compras', permissionKey: 'gestion-de-compra' },
      { permissionName: 'Reservas', permissionKey: 'reservas' },
      { permissionName: 'Clientes', permissionKey: 'clientes' },
      { permissionName: 'Servicios', permissionKey: 'servicios' },
      { permissionName: 'Mano de obra', permissionKey: 'mano-de-obra' },
      { permissionName: 'Empleados', permissionKey: 'empleados' },
    ];

    // Consultar los permisos existentes en la base de datos
    const existingPermissions = await queryInterface.sequelize.query(
      `SELECT "permissionKey" FROM permissions`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingKeys = existingPermissions.map(p => p.permissionKey);

    // Filtrar los nuevos permisos
    const newPermissions = permissionsToEnsure
      .filter(p => !existingKeys.includes(p.permissionKey))
      .map(p => ({
        ...p,
        status: true, // este sí existe en tu modelo
      }));

    // Insertar los permisos que falten
    if (newPermissions.length > 0) {
      await queryInterface.bulkInsert('permissions', newPermissions, {});
      console.log(`✅ Insertados ${newPermissions.length} nuevos permisos.`);
    } else {
      console.log('🔸 No hay nuevos permisos para insertar.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
