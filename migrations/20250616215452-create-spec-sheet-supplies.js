'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecSheetSupplies', {
      idSpecSheetSupply: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idSpecSheet: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SpecSheets',
          key: 'idSpecSheet'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idSupply: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'supplies',
          key: 'idSupply'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      idPurchaseDetail: { // FK opcional a un lote específico
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'PurchaseDetails',
            key: 'idPurchaseDetail'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Si se borra el detalle de compra, no se rompe la receta
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false
      },
      unitOfMeasure: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Índice para evitar que el mismo insumo se agregue dos veces a la misma ficha
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