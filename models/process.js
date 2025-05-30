// models/process.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Process = sequelize.define('Process', {
    idProcess: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    processName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Otros campos como: defaultDuration, category, etc.
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Processes',
    timestamps: true
});

module.exports = Process;