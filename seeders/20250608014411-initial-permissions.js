'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('permissions', [
      { idPermission: 1, permissionName: 'Dashboard', permissionKey: 'dashboard', status: true },
      { idPermission: 2, permissionName: 'Roles', permissionKey: 'roles', status: true },
      { idPermission: 3, permissionName: 'Usuarios', permissionKey: 'usuarios', status: true },
      { idPermission: 4, permissionName: 'Proveedores', permissionKey: 'proveedores', status: true },
      { idPermission: 5, permissionName: 'Insumo', permissionKey: 'insumo', status: true },
      { idPermission: 6, permissionName: 'Producto Insumo', permissionKey: 'producto-insumo', status: true },
      { idPermission: 7, permissionName: 'Orden de producción', permissionKey: 'orden-produccion', status: true },
      { idPermission: 8, permissionName: 'Gestión de compras', permissionKey: 'gestion-de-compra', status: true },
      { idPermission: 9, permissionName: 'Reservas', permissionKey: 'reservas', status: true },
      { idPermission: 10, permissionName: 'Clientes', permissionKey: 'clientes', status: true },
      { idPermission: 11, permissionName: 'Servicios', permissionKey: 'servicios', status: true },
      { idPermission: 12, permissionName: 'Mano de obra', permissionKey: 'mano-de-obra', status: true },
      { idPermission: 13, permissionName: 'Empleados', permissionKey: 'empleados', status: true },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};