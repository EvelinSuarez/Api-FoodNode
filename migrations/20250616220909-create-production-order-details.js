'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductionOrderDetails', {
      idProductionOrderDetail: {
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
      idProcess: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Processes',
          key: 'idProcess'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      // --- FIN DE FKs ---
      processOrder: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      processNameSnapshot: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      processDescriptionSnapshot: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimatedTimeMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      observations: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductionOrderDetails');
  }
};