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
    portions: {
        type: DataTypes.INTEGER,
        allowNull: true, // o false si es obligatorio
        comment: 'Número de porciones que rinde la receta.'
    },
    totalCost: {
        type: DataTypes.DECIMAL(12, 2), // Espacio para costos más grandes
        allowNull: true, // Puede ser nulo si no se ha calculado
        defaultValue: 0.00,
        comment: 'Costo total de todos los ingredientes de la receta.'
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