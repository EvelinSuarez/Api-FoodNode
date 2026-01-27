'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecSheets', {
      idSpecSheet: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idProduct: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'idProduct'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      versionName: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quantityBase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      unitOfMeasure: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      portions: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      // --- ESTOS FALTABAN EN TU MIGRACIÓN ---
      totalCost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      totalEstimatedTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      // ---------------------------------------
      dateEffective: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    await queryInterface.dropTable('SpecSheets');
  }
};