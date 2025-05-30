// models/specSheetProcess.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecSheetProcess = sequelize.define('SpecSheetProcess', {
    idSpecSheetProcess: { // PK
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idSpecSheet (FK) se añade por asociación
    // idProcess (FK) se añade por asociación
    processOrder: { // Orden de este proceso dentro de la ficha técnica
        type: DataTypes.INTEGER,
        allowNull: false
    },
    processNameOverride: { // Si se quiere un nombre específico para este paso en ESTA ficha
        type: DataTypes.STRING(150),
        allowNull: true
    },
    processDescriptionOverride: { // Descripción específica para este paso en ESTA ficha
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedTimeMinutes: { // Tiempo estimado para este paso en ESTA ficha
        type: DataTypes.INTEGER, // en minutos
        allowNull: true
    }
}, {
    tableName: 'SpecSheetProcesses',
    timestamps: true
});

module.exports = SpecSheetProcess;