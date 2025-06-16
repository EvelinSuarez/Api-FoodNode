'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PurchaseDetails', {
      idPurchaseDetail: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idRegisterPurchase: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'RegisterPurchases',
          key: 'idRegisterPurchase'
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
      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      taxAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      discountPercentage: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      discountAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      itemTotal: {
        type: Sequelize.DECIMAL(12, 2),
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
    await queryInterface.dropTable('PurchaseDetails');
  }
};