'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Define la lista completa de permisos que deberían existir.
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

    // 2. Consulta la base de datos para ver qué `permissionKey` ya existen.
    // Usamos `permissionKey` porque es único y más fiable que el nombre.
    const existingPermissions = await queryInterface.sequelize.query(
      `SELECT "permissionKey" FROM permissions`, // Asegúrate que el nombre de la tabla 'permissions' sea correcto
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingPermissionKeys = existingPermissions.map(p => p.permissionKey);

    // 3. Filtra la lista para quedarte solo con los permisos que NO existen en la BD.
    const newPermissions = permissionsToEnsure
      .filter(p => !existingPermissionKeys.includes(p.permissionKey))
      .map(p => ({
        ...p,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    // 4. Si hay algo nuevo que insertar, hazlo. De lo contrario, no hagas nada.
    if (newPermissions.length > 0) {
      await queryInterface.bulkInsert('permissions', newPermissions, {});
      console.log(`Seeder: Insertados ${newPermissions.length} nuevos permisos.`);
    } else {
      console.log('Seeder: No hay nuevos permisos para insertar. La tabla "permissions" ya está actualizada.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // El 'down' puede borrar todo para pruebas, está bien.
    await queryInterface.bulkDelete('permissions', null, {});
  }
};