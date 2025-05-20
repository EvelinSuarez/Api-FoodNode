// models/MonthlyExpenseItem.js (NUEVO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MonthlyOverallExpense = require('./monthlyOverallExpense');
const SpecificConceptSpent = require('./SpecificConceptSpent'); // Referencia a los conceptos específicos

const MonthlyExpenseItem = sequelize.define('MonthlyExpenseItem', {
    idMonthlyExpenseItem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idOverallMonth: { // FK a la cabecera del gasto mensual
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MonthlyOverallExpense,
            key: 'idOverallMonth'
        }
    },
    idSpecificConcept: { // FK al concepto específico (ej: "Sueldo Empleado Aux")
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SpecificConceptSpent,
            key: 'idSpecificConcept'
        }
    },
    price: { // Precio final calculado para ESTE item
        type: DataTypes.DECIMAL(10, 2), // Usa DECIMAL o FLOAT
        allowNull: false
    },
    baseSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Nulo si no es un concepto de tipo sueldo
    },
    numEmployees: {
        type: DataTypes.INTEGER,
        allowNull: true // Nulo si no es un concepto de tipo sueldo
    },
    hasBonus: { // Renombrado desde addBonus para evitar confusión con palabra reservada
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    bonusAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Nulo si hasBonus es false o no aplica
    }
    // Puedes añadir itemNotes si es necesario
}, {
    tableName: 'monthly_expense_item'
});

// Relaciones
MonthlyOverallExpense.hasMany(MonthlyExpenseItem, { foreignKey: 'idOverallMonth', as: 'expenseItems' });
MonthlyExpenseItem.belongsTo(MonthlyOverallExpense, { foreignKey: 'idOverallMonth', as: 'overallExpenseRecord' });

MonthlyExpenseItem.belongsTo(SpecificConceptSpent, { foreignKey: 'idSpecificConcept', as: 'conceptDetails' });
SpecificConceptSpent.hasMany(MonthlyExpenseItem, { foreignKey: 'idSpecificConcept', as: 'itemsInMonthlyRecords' });

module.exports = MonthlyExpenseItem;