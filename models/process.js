const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Process = sequelize.define('process', {
    idProcess: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    processName: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    description: { 
        type: DataTypes.STRING(255), 
        allowNull: true 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, {
    timestamps: true
});

module.exports = Process;