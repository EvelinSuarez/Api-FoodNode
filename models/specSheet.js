// models/SpecSheet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Tu instancia de sequelize

const SpecSheet = sequelize.define('SpecSheet', {
    idSpecSheet: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idProduct es FK
    versionName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    quantityBase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
    },
    // --- NUEVO CAMPO ---
    unitOfMeasure: { // Unidad para la quantityBase. Ej: 'unidad', 'kg', 'L'
        type: DataTypes.STRING(50),
        allowNull: false // O true si puede ser opcional, pero generalmente es requerida
    },
    // --- FIN NUEVO CAMPO ---
    dateEffective: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'SpecSheets',
    timestamps: true
});

module.exports = SpecSheet;