'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyExpenseItem = sequelize.define('MonthlyExpenseItem', {
    idExpenseItem: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN 1: Unificar a UNSIGNED
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_expense_item'
    },
    // --- CORRECCIÓN CLAVE: Definir las FKs explícitamente en el modelo ---
    idOverallMonth: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN 2: Tipo de dato IDÉNTICO al de su padre
        allowNull: false,
        field: 'id_overall_month',
        references: {
            model: 'monthly_overall_expenses', // Referencia a la tabla padre
            key: 'id_overall_month',         // Referencia a la columna padre
        }
    },
    idSpecificConcept: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN 3: Tipo de dato IDÉNTICO al de su padre
        allowNull: false,
        field: 'id_specific_concept',
        references: {
            model: 'specific_concept_spent', // Referencia a la tabla padre
            key: 'id_specific_concept',    // Referencia a la columna padre
        }
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'price'
    },
    baseSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'base_salary'
    },
    numEmployees: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'num_employees'
    },
    hasBonus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'has_bonus'
    },
    bonusAmountValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'bonus_amount_value'
    },
}, {
    tableName: 'monthly_expense_items',
    timestamps: true,
    underscored: true // <-- BUENA PRÁCTICA: Mantiene la consistencia
});

module.exports = MonthlyExpenseItem;
