'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      idCustomers: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      distintive: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      customerCategory: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      cellphone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      address: {
        type: Sequelize.STRING(120),
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
    await queryInterface.dropTable('customers');
  }
};