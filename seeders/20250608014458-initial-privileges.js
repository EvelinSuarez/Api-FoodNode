'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('privileges', [
      // Dashboard (Permission ID: 1)
      { idPrivilege: 1, privilegeName: 'Ver Dashboard', privilegeKey: 'view', idPermission: 1, status: 1 },
      { idPrivilege: 2, privilegeName: 'Crear Dashboard', privilegeKey: 'create', idPermission: 1, status: 1 },
      { idPrivilege: 3, privilegeName: 'Editar Dashboard', privilegeKey: 'edit', idPermission: 1, status: 1 },
      { idPrivilege: 4, privilegeName: 'Cambiar estado Dashboard', privilegeKey: 'status', idPermission: 1, status: 1 },
      { idPrivilege: 5, privilegeName: 'Eliminar Dashboard', privilegeKey: 'delete', idPermission: 1, status: 1 },
      { idPrivilege: 6, privilegeName: 'Ver detalle Dashboard', privilegeKey: 'view-detail', idPermission: 1, status: 1 },

      // Roles (Permission ID: 2)
      { idPrivilege: 7, privilegeName: 'Ver Roles', privilegeKey: 'view', idPermission: 2, status: 1 },
      { idPrivilege: 8, privilegeName: 'Crear Roles', privilegeKey: 'create', idPermission: 2, status: 1 },
      { idPrivilege: 9, privilegeName: 'Editar Roles', privilegeKey: 'edit', idPermission: 2, status: 1 },
      { idPrivilege: 10, privilegeName: 'Cambiar estado Roles', privilegeKey: 'status', idPermission: 2, status: 1 },
      { idPrivilege: 11, privilegeName: 'Eliminar Roles', privilegeKey: 'delete', idPermission: 2, status: 1 },
      { idPrivilege: 12, privilegeName: 'Ver detalle Roles', privilegeKey: 'view-detail', idPermission: 2, status: 1 },

      // Usuarios (Permission ID: 3)
      { idPrivilege: 13, privilegeName: 'Ver Usuarios', privilegeKey: 'view', idPermission: 3, status: 1 },
      { idPrivilege: 14, privilegeName: 'Crear Usuarios', privilegeKey: 'create', idPermission: 3, status: 1 },
      { idPrivilege: 15, privilegeName: 'Editar Usuarios', privilegeKey: 'edit', idPermission: 3, status: 1 },
      { idPrivilege: 16, privilegeName: 'Cambiar estado Usuarios', privilegeKey: 'status', idPermission: 3, status: 1 },
      { idPrivilege: 17, privilegeName: 'Eliminar Usuarios', privilegeKey: 'delete', idPermission: 3, status: 1 },
      { idPrivilege: 18, privilegeName: 'Ver detalle Usuarios', privilegeKey: 'view-detail', idPermission: 3, status: 1 },

      // Proveedores (Permission ID: 4)
      { idPrivilege: 19, privilegeName: 'Ver Proveedores', privilegeKey: 'view', idPermission: 4, status: 1 },
      { idPrivilege: 20, privilegeName: 'Crear Proveedores', privilegeKey: 'create', idPermission: 4, status: 1 },
      { idPrivilege: 21, privilegeName: 'Editar Proveedores', privilegeKey: 'edit', idPermission: 4, status: 1 },
      { idPrivilege: 22, privilegeName: 'Cambiar estado Proveedores', privilegeKey: 'status', idPermission: 4, status: 1 },
      { idPrivilege: 23, privilegeName: 'Eliminar Proveedores', privilegeKey: 'delete', idPermission: 4, status: 1 },
      { idPrivilege: 24, privilegeName: 'Ver detalle Proveedores', privilegeKey: 'view-detail', idPermission: 4, status: 1 },

      // Insumo (Permission ID: 5)
      { idPrivilege: 25, privilegeName: 'Ver Insumo', privilegeKey: 'view', idPermission: 5, status: 1 },
      { idPrivilege: 26, privilegeName: 'Crear Insumo', privilegeKey: 'create', idPermission: 5, status: 1 },
      { idPrivilege: 27, privilegeName: 'Editar Insumo', privilegeKey: 'edit', idPermission: 5, status: 1 },
      { idPrivilege: 28, privilegeName: 'Cambiar estado Insumo', privilegeKey: 'status', idPermission: 5, status: 1 },
      { idPrivilege: 29, privilegeName: 'Eliminar Insumo', privilegeKey: 'delete', idPermission: 5, status: 1 },
      { idPrivilege: 30, privilegeName: 'Ver detalle Insumo', privilegeKey: 'view-detail', idPermission: 5, status: 1 },

      // Producto Insumo (Permission ID: 6)
      { idPrivilege: 31, privilegeName: 'Ver Producto Insumo', privilegeKey: 'view', idPermission: 6, status: 1 },
      { idPrivilege: 32, privilegeName: 'Crear Producto Insumo', privilegeKey: 'create', idPermission: 6, status: 1 },
      { idPrivilege: 33, privilegeName: 'Editar Producto Insumo', privilegeKey: 'edit', idPermission: 6, status: 1 },
      { idPrivilege: 34, privilegeName: 'Cambiar estado Producto Insumo', privilegeKey: 'status', idPermission: 6, status: 1 },
      { idPrivilege: 35, privilegeName: 'Eliminar Producto Insumo', privilegeKey: 'delete', idPermission: 6, status: 1 },
      { idPrivilege: 36, privilegeName: 'Ver detalle Producto Insumo', privilegeKey: 'view-detail', idPermission: 6, status: 1 },

      // Orden de producción (Permission ID: 7)
      { idPrivilege: 37, privilegeName: 'Ver Orden de producción', privilegeKey: 'view', idPermission: 7, status: 1 },
      { idPrivilege: 38, privilegeName: 'Crear Orden de producción', privilegeKey: 'create', idPermission: 7, status: 1 },
      { idPrivilege: 39, privilegeName: 'Editar Orden de producción', privilegeKey: 'edit', idPermission: 7, status: 1 },
      { idPrivilege: 40, privilegeName: 'Cambiar estado Orden de producción', privilegeKey: 'status', idPermission: 7, status: 1 },
      { idPrivilege: 41, privilegeName: 'Eliminar Orden de producción', privilegeKey: 'delete', idPermission: 7, status: 1 },
      { idPrivilege: 42, privilegeName: 'Ver detalle Orden de producción', privilegeKey: 'view-detail', idPermission: 7, status: 1 },

      // Gestión de compras (Permission ID: 8)
      { idPrivilege: 43, privilegeName: 'Ver Gestión de compras', privilegeKey: 'view', idPermission: 8, status: 1 },
      { idPrivilege: 44, privilegeName: 'Crear Gestión de compras', privilegeKey: 'create', idPermission: 8, status: 1 },
      { idPrivilege: 45, privilegeName: 'Editar Gestión de compras', privilegeKey: 'edit', idPermission: 8, status: 1 },
      { idPrivilege: 46, privilegeName: 'Cambiar estado Gestión de compras', privilegeKey: 'status', idPermission: 8, status: 1 },
      { idPrivilege: 47, privilegeName: 'Eliminar Gestión de compras', privilegeKey: 'delete', idPermission: 8, status: 1 },
      { idPrivilege: 48, privilegeName: 'Ver detalle Gestión de compras', privilegeKey: 'view-detail', idPermission: 8, status: 1 },

      // Reservas (Permission ID: 9)
      { idPrivilege: 49, privilegeName: 'Ver Reservas', privilegeKey: 'view', idPermission: 9, status: 1 },
      { idPrivilege: 50, privilegeName: 'Crear Reservas', privilegeKey: 'create', idPermission: 9, status: 1 },
      { idPrivilege: 51, privilegeName: 'Editar Reservas', privilegeKey: 'edit', idPermission: 9, status: 1 },
      { idPrivilege: 52, privilegeName: 'Cambiar estado Reservas', privilegeKey: 'status', idPermission: 9, status: 1 },
      { idPrivilege: 53, privilegeName: 'Eliminar Reservas', privilegeKey: 'delete', idPermission: 9, status: 1 },
      { idPrivilege: 54, privilegeName: 'Ver detalle Reservas', privilegeKey: 'view-detail', idPermission: 9, status: 1 },

      // Clientes (Permission ID: 10)
      { idPrivilege: 55, privilegeName: 'Ver Clientes', privilegeKey: 'view', idPermission: 10, status: 1 },
      { idPrivilege: 56, privilegeName: 'Crear Clientes', privilegeKey: 'create', idPermission: 10, status: 1 },
      { idPrivilege: 57, privilegeName: 'Editar Clientes', privilegeKey: 'edit', idPermission: 10, status: 1 },
      { idPrivilege: 58, privilegeName: 'Cambiar estado Clientes', privilegeKey: 'status', idPermission: 10, status: 1 },
      { idPrivilege: 59, privilegeName: 'Eliminar Clientes', privilegeKey: 'delete', idPermission: 10, status: 1 },
      { idPrivilege: 60, privilegeName: 'Ver detalle Clientes', privilegeKey: 'view-detail', idPermission: 10, status: 1 },

      // Servicios (Permission ID: 11)
      { idPrivilege: 61, privilegeName: 'Ver Servicios', privilegeKey: 'view', idPermission: 11, status: 1 },
      { idPrivilege: 62, privilegeName: 'Crear Servicios', privilegeKey: 'create', idPermission: 11, status: 1 },
      { idPrivilege: 63, privilegeName: 'Editar Servicios', privilegeKey: 'edit', idPermission: 11, status: 1 },
      { idPrivilege: 64, privilegeName: 'Cambiar estado Servicios', privilegeKey: 'status', idPermission: 11, status: 1 },
      { idPrivilege: 65, privilegeName: 'Eliminar Servicios', privilegeKey: 'delete', idPermission: 11, status: 1 },
      { idPrivilege: 66, privilegeName: 'Ver detalle Servicios', privilegeKey: 'view-detail', idPermission: 11, status: 1 },

      // Mano de obra (Permission ID: 12)
      { idPrivilege: 67, privilegeName: 'Ver Mano de obra', privilegeKey: 'view', idPermission: 12, status: 1 },
      { idPrivilege: 68, privilegeName: 'Crear Mano de obra', privilegeKey: 'create', idPermission: 12, status: 1 },
      { idPrivilege: 69, privilegeName: 'Editar Mano de obra', privilegeKey: 'edit', idPermission: 12, status: 1 },
      { idPrivilege: 70, privilegeName: 'Cambiar estado Mano de obra', privilegeKey: 'status', idPermission: 12, status: 1 },
      { idPrivilege: 71, privilegeName: 'Eliminar Mano de obra', privilegeKey: 'delete', idPermission: 12, status: 1 },
      { idPrivilege: 72, privilegeName: 'Ver detalle Mano de obra', privilegeKey: 'view-detail', idPermission: 12, status: 1 },

      // Empleados (Permission ID: 13)
      { idPrivilege: 73, privilegeName: 'Ver Empleados', privilegeKey: 'view', idPermission: 13, status: 1 },
      { idPrivilege: 74, privilegeName: 'Crear Empleados', privilegeKey: 'create', idPermission: 13, status: 1 },
      { idPrivilege: 75, privilegeName: 'Editar Empleados', privilegeKey: 'edit', idPermission: 13, status: 1 },
      { idPrivilege: 76, privilegeName: 'Cambiar estado Empleados', privilegeKey: 'status', idPermission: 13, status: 1 },
      { idPrivilege: 77, privilegeName: 'Eliminar Empleados', privilegeKey: 'delete', idPermission: 13, status: 1 },
      { idPrivilege: 78, privilegeName: 'Ver detalle Empleados', privilegeKey: 'view-detail', idPermission: 13, status: 1 },

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('privileges', null, {});
  }
};