// ...-create-spec-sheet-supplies.js
// --- COPIA Y PEGA ESTE CONTENIDO COMPLETO ---
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecSheetSupplies', {
      // ... (idSpecSheetSupply, idSpecSheet sin cambios) ...
      idSpecSheetSupply: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      idSpecSheet: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'SpecSheets', key: 'idSpecSheet' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      
      idSupply: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Supplies', // <-- CORRECCIÓN: 'supplies' a 'Supplies' por convención
          key: 'idSupply'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      // ... (resto de campos sin cambios) ...
      idPurchaseDetail: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'PurchaseDetails', key: 'idPurchaseDetail' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      unitOfMeasure: { type: Sequelize.STRING(50), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('SpecSheetSupplies', ['idSpecSheet', 'idSupply'], {
      unique: true,
      name: 'uq_spec_sheet_supply'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('SpecSheetSupplies', 'uq_spec_sheet_supply');
    await queryInterface.dropTable('SpecSheetSupplies');
  }
};