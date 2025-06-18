'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('monthly_expense_items', {
      id_expense_item: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_overall_month: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'monthly_overall_expenses', // Tabla padre
          key: 'id_overall_month'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra el mes, se borran sus items
      },
      id_specific_concept: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'specific_concept_spent', // Tabla padre
          key: 'id_specific_concept'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No borrar un concepto si está en uso
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      base_salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      num_employees: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      has_bonus: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      bonus_amount_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
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
    await queryInterface.dropTable('monthly_expense_items');
  }
};

