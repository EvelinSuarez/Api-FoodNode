// migrations/YYYYMMDDHHMMSS-create-specific-concept-spent.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('specific_concept_spent', {
      id_specific_concept: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_expense_category: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'expense_category', // La tabla a la que hace referencia
          key: 'id_expense_category' // La columna a la que hace referencia
        },
        onUpdate: 'CASCADE', // Opcional: define comportamiento en cascada
        onDelete: 'RESTRICT' // Opcional: previene borrar una categoría si tiene conceptos
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(250),
        allowNull: true
      },
      requires_employee_calculation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      is_bimonthly: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
    await queryInterface.dropTable('specific_concept_spent');
  }
};