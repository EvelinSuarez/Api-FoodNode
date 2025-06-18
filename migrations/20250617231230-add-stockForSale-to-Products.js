'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Products',           // Nombre de la tabla
      'stockForSale',       // Nombre de la nueva columna
      {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        after: 'currentStock' // Opcional: la coloca después de la columna currentStock
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'stockForSale');
  }
};