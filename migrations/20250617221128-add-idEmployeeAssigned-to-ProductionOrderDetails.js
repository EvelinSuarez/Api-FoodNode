'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Añadir la columna solo si NO existe (idempotente)
    const tableDesc = await queryInterface.describeTable('ProductionOrderDetails');
    if (!tableDesc.idEmployeeAssigned) {
      await queryInterface.addColumn(
        'ProductionOrderDetails', // 1. Nombre EXACTO de la tabla en tu base de datos
        'idEmployeeAssigned',     // 2. Nombre de la nueva columna que quieres crear
        {                         // 3. Opciones de la columna
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Employees', // Nombre de la tabla a la que se conecta
            key: 'idEmployee',  // Columna de esa tabla a la que se conecta
          },
          onUpdate: 'CASCADE',  // Si el id del empleado cambia, se actualiza aquí
          onDelete: 'SET NULL', // Si se borra un empleado, el paso queda sin asignar (no se borra el paso)
        }
      );
    }
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la columna solo si existe (idempotente)
    const tableDesc = await queryInterface.describeTable('ProductionOrderDetails');
    if (tableDesc.idEmployeeAssigned) {
      await queryInterface.removeColumn('ProductionOrderDetails', 'idEmployeeAssigned');
    }
  }
};