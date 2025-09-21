'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Comando para añadir la nueva columna 'sellingPrice' a la tabla 'Products'.
     */
    await queryInterface.addColumn(
      'Products',           // Nombre de la tabla
      'sellingPrice',       // Nombre de la nueva columna
      {                     // Definición de la columna
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        after: 'stockForSale' // Opcional: Coloca la nueva columna después de 'stockForSale' para un mejor orden.
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Comando para revertir los cambios, eliminando la columna 'sellingPrice'.
     */
    await queryInterface.removeColumn('Products', 'sellingPrice');
  }
};