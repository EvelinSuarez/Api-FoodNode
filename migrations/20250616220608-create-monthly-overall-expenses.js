'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('monthly_overall_expenses', {
      id_overall_month: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date_overall_exp: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      value_expense: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      novelty_expense: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('monthly_overall_expenses');
  }
};