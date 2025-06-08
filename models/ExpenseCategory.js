'use strict'; // Buena práctica para evitar errores comunes
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
    idExpenseCategory: {
        type: DataTypes.INTEGER.UNSIGNED, // <-- CORRECCIÓN CLAVE: ¡DEBE SER UNSIGNED!
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_expense_category' // Mapeo explícito a snake_case
    },
    name: {
        type: DataTypes.STRING(100), // Ajustado a un tamaño más razonable para un nombre
        allowNull: false,
        unique: true,
        field: 'name' // Mapeo explícito
    },
    description: {
        type: DataTypes.STRING(250),
        allowNull: true,
        field: 'description' // Mapeo explícito
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false, // Es mejor que el status no sea nulo
        field: 'status' // Mapeo explícito
    }
}, {
    tableName: 'expense_category',
    timestamps: true, // Asegura createdAt y updatedAt
    underscored: true, // Convierte automáticamente camelCase a snake_case
    // El 'indexes' que tenías es redundante si 'unique: true' ya está en el campo 'name',
    // pero dejarlo no hace daño. Sequelize es lo suficientemente inteligente.
});

module.exports = ExpenseCategory;
