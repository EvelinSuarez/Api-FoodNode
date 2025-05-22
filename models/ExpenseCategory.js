// models/ExpenseCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
    idExpenseCategory: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: { // Ej: "Mano de Obra", "Servicios Públicos"
        type: DataTypes.STRING(250),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(250),
        allowNull: true // A menudo las descripciones de categorías son opcionales
    },
    // isBimonthly: ELIMINADO DE AQUÍ
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [{ unique: true, fields: ['name'] }],
    tableName: 'expense_category'
});

module.exports = ExpenseCategory;