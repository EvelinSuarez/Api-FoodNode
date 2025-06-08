'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = require('./ExpenseCategory'); // Asegúrate que el nombre de archivo sea correcto

const SpecificConceptSpent = sequelize.define('SpecificConceptSpent', {
    idSpecificConcept: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN 1: Unificar a UNSIGNED
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_specific_concept'
    },
    idExpenseCategory: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN 2: Unificar a UNSIGNED
        allowNull: false,
        field: 'id_expense_category',
        references: {
            model: 'expense_category', // Usar nombre de tabla
            key: 'id_expense_category'   // Usar nombre de columna
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'name'
    },
    description: {
        type: DataTypes.STRING(250),
        allowNull: true,
        field: 'description'
    },
    requiresEmployeeCalculation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'requires_employee_calculation'
    },
    isBimonthly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_bimonthly'
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'status'
    }
}, {
    tableName: 'specific_concept_spent',
    timestamps: true,
    underscored: true // <-- BUENA PRÁCTICA: Mantiene la consistencia
});

module.exports = SpecificConceptSpent;