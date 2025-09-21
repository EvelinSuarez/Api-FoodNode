// models/specSheetProcess.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecSheetProcess = sequelize.define('SpecSheetProcess', {
    idSpecSheetProcess: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    
    // --- CAMBIO CRÍTICO: Definir las FK explícitamente ---
    idSpecSheet: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SpecSheets',
            key: 'idSpecSheet'
        }
    },
    idProcess: {
        type: DataTypes.INTEGER,
        allowNull: true, // Importante que sea 'true' para pasos personalizados
        references: {
            model: 'Processes',
            key: 'idProcess'
        }
    },
    // --- FIN DEL CAMBIO ---

    processOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    processNameOverride: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    processDescriptionOverride: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'SpecSheetProcesses',
    timestamps: true
});

module.exports = SpecSheetProcess;