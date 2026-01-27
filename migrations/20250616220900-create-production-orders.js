'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductionOrders', {
      idProductionOrder: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // --- CLAVES FORÁNEAS (FKs) ---
      idProduct: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Products',
          key: 'idProduct'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      idSpecSheet: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'SpecSheets',
          key: 'idSpecSheet'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      idEmployeeRegistered: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'idEmployee'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      idProvider: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Providers',
          key: 'idProvider'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // --- FIN DE FKs ---
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      dateTimeCreation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      productNameSnapshot: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      initialAmount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inputInitialWeight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      inputInitialWeightUnit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      finalQuantityProduct: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      finishedProductWeight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      finishedProductWeightUnit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      inputFinalWeightUnused: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      inputFinalWeightUnusedUnit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      totalEstimatedTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      totalActualTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING'
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
    await queryInterface.dropTable('ProductionOrders');
  }
};