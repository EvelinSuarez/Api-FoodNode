'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'supplies',           // 1. Nombre EXACTO de tu tabla de insumos
      'idProduct',          // 2. Nombre de la nueva columna
      {
        type: Sequelize.INTEGER,
        allowNull: true, // Pon 'true' para poder crear insumos sin vincularlos inmediatamente
        references: {
          model: 'Products', // Nombre de la tabla de productos
          key: 'idProduct',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Si se borra el producto, el insumo queda desvinculado
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('supplies', 'idProduct');
  }
};