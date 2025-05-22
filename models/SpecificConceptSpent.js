// models/SpecificConceptSpent.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ExpenseCategory = require('./ExpenseCategory'); // Importar para la definición de FK y asociación

const SpecificConceptSpent = sequelize.define('SpecificConceptSpent', {
    idSpecificConcept: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idExpenseCategory: { // Clave foránea directa
        type: DataTypes.INTEGER,
        allowNull: false, // Un concepto DEBE tener una categoría
        references: {
            model: ExpenseCategory, // Referencia directa al modelo importado
            key: 'idExpenseCategory'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    requiresEmployeeCalculation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    isBimonthly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'specific_concept_spent',
    indexes: [
        // Índice para asegurar que el nombre sea único DENTRO de cada categoría
        {
            unique: true,
            fields: ['idExpenseCategory', 'name'],
            name: 'uq_concept_name_in_category' // Nombre corto y explícito
        }
    ]
});

module.exports = SpecificConceptSpent;