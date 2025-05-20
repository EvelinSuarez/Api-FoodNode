// models/ExpenseType.js (Renombrando tu ConceptSpent.js para claridad)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseType = sequelize.define('ExpenseType', {
    idExpenseType: { // Este es el PK que representa un TIPO GENERAL de gasto
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
        allowNull: false
    },
    isBimonthly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ],
    tableName: 'expense_type' // Sugiero un nombre de tabla más claro
});

module.exports = ExpenseType;