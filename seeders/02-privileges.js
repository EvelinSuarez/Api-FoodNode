'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Definimos los privilegios base
    const basePrivileges = [
      // Dashboard (idPermission: 1)
      { privilegeName: 'Ver Dashboard', privilegeKey: 'view', idPermission: 1 },
      { privilegeName: 'Crear Dashboard', privilegeKey: 'create', idPermission: 1 },
      { privilegeName: 'Editar Dashboard', privilegeKey: 'edit', idPermission: 1 },
      { privilegeName: 'Cambiar estado Dashboard', privilegeKey: 'status', idPermission: 1 },
      { privilegeName: 'Eliminar Dashboard', privilegeKey: 'delete', idPermission: 1 },
      { privilegeName: 'Ver detalle Dashboard', privilegeKey: 'view-detail', idPermission: 1 },

      // Roles (idPermission: 2)
      { privilegeName: 'Ver Roles', privilegeKey: 'view', idPermission: 2 },
      { privilegeName: 'Crear Roles', privilegeKey: 'create', idPermission: 2 },
      { privilegeName: 'Editar Roles', privilegeKey: 'edit', idPermission: 2 },
      { privilegeName: 'Cambiar estado Roles', privilegeKey: 'status', idPermission: 2 },
      { privilegeName: 'Eliminar Roles', privilegeKey: 'delete', idPermission: 2 },
      { privilegeName: 'Ver detalle Roles', privilegeKey: 'view-detail', idPermission: 2 },

      // Usuarios (idPermission: 3)
      { privilegeName: 'Ver Usuarios', privilegeKey: 'view', idPermission: 3 },
      { privilegeName: 'Crear Usuarios', privilegeKey: 'create', idPermission: 3 },
      { privilegeName: 'Editar Usuarios', privilegeKey: 'edit', idPermission: 3 },
      { privilegeName: 'Cambiar estado Usuarios', privilegeKey: 'status', idPermission: 3 },
      { privilegeName: 'Eliminar Usuarios', privilegeKey: 'delete', idPermission: 3 },
      { privilegeName: 'Ver detalle Usuarios', privilegeKey: 'view-detail', idPermission: 3 },

      // Proveedores (idPermission: 4)
      { privilegeName: 'Ver Proveedores', privilegeKey: 'view', idPermission: 4 },
      { privilegeName: 'Crear Proveedores', privilegeKey: 'create', idPermission: 4 },
      { privilegeName: 'Editar Proveedores', privilegeKey: 'edit', idPermission: 4 },
      { privilegeName: 'Cambiar estado Proveedores', privilegeKey: 'status', idPermission: 4 },
      { privilegeName: 'Eliminar Proveedores', privilegeKey: 'delete', idPermission: 4 },
      { privilegeName: 'Ver detalle Proveedores', privilegeKey: 'view-detail', idPermission: 4 },

      // Insumo (idPermission: 5)
      { privilegeName: 'Ver Insumo', privilegeKey: 'view', idPermission: 5 },
      { privilegeName: 'Crear Insumo', privilegeKey: 'create', idPermission: 5 },
      { privilegeName: 'Editar Insumo', privilegeKey: 'edit', idPermission: 5 },
      { privilegeName: 'Cambiar estado Insumo', privilegeKey: 'status', idPermission: 5 },
      { privilegeName: 'Eliminar Insumo', privilegeKey: 'delete', idPermission: 5 },
      { privilegeName: 'Ver detalle Insumo', privilegeKey: 'view-detail', idPermission: 5 },

      // Producto (idPermission: 6)
      { privilegeName: 'Ver Producto', privilegeKey: 'view', idPermission: 6 },
      { privilegeName: 'Crear Producto', privilegeKey: 'create', idPermission: 6 },
      { privilegeName: 'Editar Producto', privilegeKey: 'edit', idPermission: 6 },
      { privilegeName: 'Cambiar estado Producto', privilegeKey: 'status', idPermission: 6 },
      { privilegeName: 'Eliminar Producto', privilegeKey: 'delete', idPermission: 6 },
      { privilegeName: 'Ver detalle Producto', privilegeKey: 'view-detail', idPermission: 6 },

      // Orden de producción (idPermission: 7)
      { privilegeName: 'Ver Orden de producción', privilegeKey: 'view', idPermission: 7 },
      { privilegeName: 'Crear Orden de producción', privilegeKey: 'create', idPermission: 7 },
      { privilegeName: 'Editar Orden de producción', privilegeKey: 'edit', idPermission: 7 },
      { privilegeName: 'Cambiar estado Orden de producción', privilegeKey: 'status', idPermission: 7 },
      { privilegeName: 'Eliminar Orden de producción', privilegeKey: 'delete', idPermission: 7 },
      { privilegeName: 'Ver detalle Orden de producción', privilegeKey: 'view-detail', idPermission: 7 },

      // Gestión de compras (idPermission: 8)
      { privilegeName: 'Ver Gestión de compras', privilegeKey: 'view', idPermission: 8 },
      { privilegeName: 'Crear Gestión de compras', privilegeKey: 'create', idPermission: 8 },
      { privilegeName: 'Editar Gestión de compras', privilegeKey: 'edit', idPermission: 8 },
      { privilegeName: 'Cambiar estado Gestión de compras', privilegeKey: 'status', idPermission: 8 },
      { privilegeName: 'Eliminar Gestión de compras', privilegeKey: 'delete', idPermission: 8 },
      { privilegeName: 'Ver detalle Gestión de compras', privilegeKey: 'view-detail', idPermission: 8 },

      // Reservas (idPermission: 9)
      { privilegeName: 'Ver Reservas', privilegeKey: 'view', idPermission: 9 },
      { privilegeName: 'Crear Reservas', privilegeKey: 'create', idPermission: 9 },
      { privilegeName: 'Editar Reservas', privilegeKey: 'edit', idPermission: 9 },
      { privilegeName: 'Cambiar estado Reservas', privilegeKey: 'status', idPermission: 9 },
      { privilegeName: 'Eliminar Reservas', privilegeKey: 'delete', idPermission: 9 },
      { privilegeName: 'Ver detalle Reservas', privilegeKey: 'view-detail', idPermission: 9 },

      // Clientes (idPermission: 10)
      { privilegeName: 'Ver Clientes', privilegeKey: 'view', idPermission: 10 },
      { privilegeName: 'Crear Clientes', privilegeKey: 'create', idPermission: 10 },
      { privilegeName: 'Editar Clientes', privilegeKey: 'edit', idPermission: 10 },
      { privilegeName: 'Cambiar estado Clientes', privilegeKey: 'status', idPermission: 10 },
      { privilegeName: 'Eliminar Clientes', privilegeKey: 'delete', idPermission: 10 },
      { privilegeName: 'Ver detalle Clientes', privilegeKey: 'view-detail', idPermission: 10 },

      // Servicios (idPermission: 11)
      { privilegeName: 'Ver Servicios', privilegeKey: 'view', idPermission: 11 },
      { privilegeName: 'Crear Servicios', privilegeKey: 'create', idPermission: 11 },
      { privilegeName: 'Editar Servicios', privilegeKey: 'edit', idPermission: 11 },
      { privilegeName: 'Cambiar estado Servicios', privilegeKey: 'status', idPermission: 11 },
      { privilegeName: 'Eliminar Servicios', privilegeKey: 'delete', idPermission: 11 },
      { privilegeName: 'Ver detalle Servicios', privilegeKey: 'view-detail', idPermission: 11 },

      // Mano de obra (idPermission: 12)
      { privilegeName: 'Ver Mano de obra', privilegeKey: 'view', idPermission: 12 },
      { privilegeName: 'Crear Mano de obra', privilegeKey: 'create', idPermission: 12 },
      { privilegeName: 'Editar Mano de obra', privilegeKey: 'edit', idPermission: 12 },
      { privilegeName: 'Cambiar estado Mano de obra', privilegeKey: 'status', idPermission: 12 },
      { privilegeName: 'Eliminar Mano de obra', privilegeKey: 'delete', idPermission: 12 },
      { privilegeName: 'Ver detalle Mano de obra', privilegeKey: 'view-detail', idPermission: 12 },

      // Empleados (idPermission: 13)
      { privilegeName: 'Ver Empleados', privilegeKey: 'view', idPermission: 13 },
      { privilegeName: 'Crear Empleados', privilegeKey: 'create', idPermission: 13 },
      { privilegeName: 'Editar Empleados', privilegeKey: 'edit', idPermission: 13 },
      { privilegeName: 'Cambiar estado Empleados', privilegeKey: 'status', idPermission: 13 },
      { privilegeName: 'Eliminar Empleados', privilegeKey: 'delete', idPermission: 13 },
      { privilegeName: 'Ver detalle Empleados', privilegeKey: 'view-detail', idPermission: 13 },
    ];

    // 2. Verificamos qué privilegios ya existen
    const [existingPrivs] = await queryInterface.sequelize.query(
      'SELECT privilegeName, idPermission FROM privileges'
    );

    // 3. Filtramos y preparamos para insertar usando los nombres correctos
    const dataToInsert = basePrivileges
      .filter(bp => {
        const alreadyExists = existingPrivs.some(ep => 
          ep.privilegeName === bp.privilegeName && ep.idPermission === bp.idPermission
        );
        return !alreadyExists;
      })
      .map(bp => ({
        privilegeName: bp.privilegeName,
        privilegeKey: bp.privilegeKey,
        idPermission: bp.idPermission,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (dataToInsert.length > 0) {
      await queryInterface.bulkInsert('privileges', dataToInsert, {});
      console.log(`✅ Insertados ${dataToInsert.length} privilegios.`);
    } else {
      console.log('🔸 No hay privilegios nuevos.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};