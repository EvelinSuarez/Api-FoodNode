'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      idProduct: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      productName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      currentStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minStock: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      maxStock: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
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
    await queryInterface.dropTable('Products');
  }
};