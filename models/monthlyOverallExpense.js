const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ExpenseType = require('./ExpenseType'); // Referencia al modelo ExpenseType renombrado

const MonthlyOverallExpense = sequelize.define('MonthlyOverallExpense', {
    idOverallMonth: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idExpenseType: { // FK al TIPO DE GASTO GENERAL (ej: "Mano de Obra")
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ExpenseType, // Referencia al modelo ExpenseType
            key: 'idExpenseType' // A la PK de ExpenseType
        }
    },
    dateOverallExp: {
        type: DataTypes.DATEONLY, // Mejor DATEONLY si no necesitas hora
        allowNull: false // Debería ser no nulo
    },
    valueExpense: { // Este será la SUMA de los 'price' de todos los MonthlyExpenseItem asociados
        type: DataTypes.DECIMAL(12, 2), // Usa DECIMAL o FLOAT para dinero
        allowNull: false
    },
    novelty_expense: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'monthly_overall_expense'
});

// Relación con ExpenseType (el tipo general del gasto mensual)
MonthlyOverallExpense.belongsTo(ExpenseType, { foreignKey: 'idExpenseType', as: 'generalExpenseType' });
ExpenseType.hasMany(MonthlyOverallExpense, { foreignKey: 'idExpenseType', as: 'monthlyRecords' });

module.exports = MonthlyOverallExpense;