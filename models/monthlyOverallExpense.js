const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ConceptSpent = require('./conceptSpent'); // Suponiendo que ConceptSpent es el modelo relacionado con idExpenseType

const MonthlyOverallExpense = sequelize.define('MonthlyOverallExpense', {
    idOverallMonth: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    idExpenseType: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: ConceptSpent, 
            key: 'idExpenseType' 
        }
    },
    dateOverallExp: { 
        type: DataTypes.DATE, 
        allowNull: true 
    },
    valueExpense: { 
        type: DataTypes.INTEGER, 
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
});

// Relación con el modelo ConceptSpent (suponiendo que existe un modelo ConceptSpent)
MonthlyOverallExpense.belongsTo(ConceptSpent, { foreignKey: 'idExpenseType' });
ConceptSpent.hasMany(MonthlyOverallExpense, { foreignKey: 'idExpenseType' });

module.exports = MonthlyOverallExpense;
