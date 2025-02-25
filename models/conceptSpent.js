const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConceptSpent = sequelize.define('ConceptSpent', {
    idExpenseType: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    name: { 
        type: DataTypes.STRING(250), 
        allowNull: false, 
        unique: true 
    },
    description: { 
        type: DataTypes.STRING(250), 
        allowNull: false 
    },
    statusS: { 
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
    tableName: 'concept_spent'
});

module.exports = ConceptSpent;
