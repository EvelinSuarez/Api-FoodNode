'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyOverallExpense = sequelize.define('MonthlyOverallExpense', {
    idOverallMonth: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN CLAVE: Unificar a UNSIGNED
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_overall_month' // Mapeo explícito a snake_case
    },
    dateOverallExp: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date_overall_exp'
    },
    valueExpense: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'value_expense'
    },
    novelty_expense: {
        type: DataTypes.STRING(250),
        allowNull: true,
        field: 'novelty_expense'
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'status'
    }
}, {
    tableName: 'monthly_overall_expenses',
    timestamps: true,
    underscored: true // <-- BUENA PRÁCTICA: Mantiene la consistencia
});

module.exports = MonthlyOverallExpense;