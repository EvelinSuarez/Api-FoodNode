'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductionOrderSupplies', {
      idProductionOrderSupply: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // --- CLAVES FORÁNEAS (FKs) ---
      idProductionOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductionOrders',
          key: 'idProductionOrder'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idSupply: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'supplies', // Nombre de la tabla de insumos
          key: 'idSupply'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      // --- FIN DE FKs ---
      quantityConsumed: {
        type: Sequelize.DECIMAL(10, 3),
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
    
    // Índice para evitar duplicados (mismo insumo en la misma orden)
    await queryInterface.addIndex(
      'ProductionOrderSupplies',
      ['idProductionOrder', 'idSupply'],
      {
        unique: true,
        name: 'uq_production_order_supply'
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ProductionOrderSupplies', 'uq_production_order_supply');
    await queryInterface.dropTable('ProductionOrderSupplies');
  }
};