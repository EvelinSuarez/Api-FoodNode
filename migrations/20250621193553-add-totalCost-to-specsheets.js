'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir columna solo si no existe (idempotente)
    const tableDesc = await queryInterface.describeTable('SpecSheets');
    if (!tableDesc.totalCost) {
      await queryInterface.addColumn('SpecSheets', 'totalCost', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Costo total de todos los ingredientes de la receta.'
      });
    }
  },
  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('SpecSheets');
    if (tableDesc.totalCost) {
      await queryInterface.removeColumn('SpecSheets', 'totalCost');
    }
  }
};