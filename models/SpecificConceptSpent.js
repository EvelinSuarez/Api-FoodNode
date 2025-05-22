// models/SpecificConceptSpent.js (NUEVO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ExpenseType = require('./ExpenseType'); // Importar el tipo de gasto general

const SpecificConceptSpent = sequelize.define('SpecificConceptSpent', {
    idSpecificConcept: { // PK para este concepto específico
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idExpenseType: { // FK a ExpenseType, indica a qué categoría general pertenece
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ExpenseType,
            key: 'idExpenseType'
        }
    },
    name: { // Ej: "Sueldo Empleado Aux", "Sueldo Jefe Cocina", "Pago Luz"
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Puedes añadir un campo para saber si requiere lógica de empleados/bono
    requiresEmployeeCalculation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
    // Otros campos relevantes para un concepto específico si los tienes
}, {
    tableName: 'specific_concept_spent',
    // Considera un índice unique compuesto para (idExpenseType, name) si los nombres deben ser únicos dentro de un tipo
    indexes: [
        {
            unique: true,
            fields: ['idExpenseType', 'name']
        }
    ]
});

// Relaciones
SpecificConceptSpent.belongsTo(ExpenseType, { foreignKey: 'idExpenseType', as: 'expenseType' });
ExpenseType.hasMany(SpecificConceptSpent, { foreignKey: 'idExpenseType', as: 'specificConcepts' });

module.exports = SpecificConceptSpent;