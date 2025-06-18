// Archivo: migrations/YYYYMMDDHHMMSS-add-stock-to-supplies.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Comando para añadir la nueva columna 'stock' a la tabla 'supplies'.
     */
    await queryInterface.addColumn(
      'supplies', // Nombre EXACTO de la tabla en la base de datos (en minúsculas y plural, como en tu primera migración)
      'stock',    // Nombre de la nueva columna
      {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000,
        comment: 'Cantidad actual del insumo en el inventario.'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Comando para revertir los cambios, eliminando la columna 'stock'.
     */
    await queryInterface.removeColumn('supplies', 'stock');
  }
};