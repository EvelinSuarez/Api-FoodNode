// models/MonthlyOverallExpense.js
'use strict'; // Buena práctica
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // <--- ¡IMPORTANTE! Importa tu instancia de Sequelize

// Opcional: Verificación para asegurar que sequelize se cargó
if (!sequelize || typeof sequelize.define !== 'function') {
  throw new Error('ERROR en MonthlyOverallExpense.js: La instancia de Sequelize no se cargó correctamente desde ../config/database.js');
}

const MonthlyOverallExpense = sequelize.define('MonthlyOverallExpense', { // Usa 'sequelize' importado
    idOverallMonth: {
        type: DataTypes.INTEGER, // Usa DataTypes directamente
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    dateOverallExp: {
        type: DataTypes.DATEONLY, // Usa DataTypes directamente
        allowNull: false
    },
    valueExpense: {
        type: DataTypes.DECIMAL(12, 2), // Usa DataTypes directamente
        allowNull: false
    },
    novelty_expense: {
        type: DataTypes.STRING(250), // Usa DataTypes directamente
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN, // Usa DataTypes directamente
        defaultValue: true,
        allowNull: false
    }
    // createdAt y updatedAt son manejados por Sequelize debido a timestamps: true
}, {
    tableName: 'monthly_overall_expenses',
    timestamps: true // Mantiene la creación de createdAt y updatedAt
});

// Si planeas usar el bucle .associate en index.js (aunque tus asociaciones están centralizadas)
// podrías añadir esto, pero es opcional si todas las asociaciones están en index.js
// MonthlyOverallExpense.associate = function(models) {
//   MonthlyOverallExpense.belongsTo(models.ExpenseCategory, {
//     foreignKey: 'idExpenseCategory',
//     as: 'categoryDetails' // Asegúrate que el alias coincida con index.js
//   });
//   MonthlyOverallExpense.hasMany(models.MonthlyExpenseItem, {
//     foreignKey: 'idOverallMonth',
//     as: 'expenseItems' // Asegúrate que el alias coincida con index.js
//   });
// };

module.exports = MonthlyOverallExpense; // <--- ¡IMPORTANTE! Exporta el modelo directamente