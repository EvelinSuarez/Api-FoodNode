'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('permissions', [
      { idPermission: 1, permissionName: 'Dashboard', permissionKey: 'dashboard', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 2, permissionName: 'Roles', permissionKey: 'roles', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 3, permissionName: 'Usuarios', permissionKey: 'usuarios', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 4, permissionName: 'Proveedores', permissionKey: 'proveedores', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 5, permissionName: 'Insumo', permissionKey: 'insumo', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 6, permissionName: 'Producto Insumo', permissionKey: 'producto-insumo', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 7, permissionName: 'Orden de producción', permissionKey: 'orden-produccion', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 8, permissionName: 'Gestión de compras', permissionKey: 'gestion-de-compra', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 9, permissionName: 'Reservas', permissionKey: 'reservas', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 10, permissionName: 'Clientes', permissionKey: 'clientes', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 11, permissionName: 'Servicios', permissionKey: 'servicios', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 12, permissionName: 'Mano de obra', permissionKey: 'mano-de-obra', status: true, createdAt: new Date(), updatedAt: new Date() },
      { idPermission: 13, permissionName: 'Empleados', permissionKey: 'empleados', status: true, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};