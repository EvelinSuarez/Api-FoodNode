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

    try {
      // 1. Buscamos qué llaves ya existen para no duplicar
      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT permissionKey FROM permissions',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const existingKeys = existingPermissions.map(p => p.permissionKey);

      // 2. Filtramos solo los que no están en la base de datos
      const newPermissions = permissionsToEnsure
        .filter(p => !existingKeys.includes(p.permissionKey))
        .map(p => ({
          permissionName: p.permissionName,
          permissionKey: p.permissionKey,
          status: true
          // NO incluyas createdAt/updatedAt aquí porque tu modelo tiene timestamps: false
        }));

      if (newPermissions.length > 0) {
        await queryInterface.bulkInsert('permissions', newPermissions, {});
        console.log(`✅ Se insertaron ${newPermissions.length} permisos nuevos.`);
      } else {
        console.log('🔸 Los permisos ya están actualizados.');
      }
    } catch (error) {
      // Si la tabla no existe aún (porque la migración falló), el log nos avisará
      console.error('⚠️ Error al sembrar permisos:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Esto limpia la tabla si decides revertir el seeder
    await queryInterface.bulkDelete('permissions', null, {});
  }
};