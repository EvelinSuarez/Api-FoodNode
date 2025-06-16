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
      idProduct: { // FK
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // Tabla creada en la tanda anterior
          key: 'idProduct'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra el producto, se borra su ficha técnica
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