// models/supply.js (ANTES supplier.js)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supply = sequelize.define('Supply', { // Nombre del modelo en singular: Supply
    idSupply: { // Clave primaria
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    supplyName: { // Nombre del insumo
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    unitOfMeasure: { // Unidad de medida base del insumo (kg, L, unidad)
        type: DataTypes.STRING(50),
        allowNull: false
    },
    // Aquí podrías tener idProvider si un insumo SIEMPRE viene de un solo proveedor,
    // pero es más flexible manejarlo en la tabla PurchaseDetail o tener una tabla intermedia SupplyProvider.
    // Por ahora, lo mantengo simple.
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    tableName: 'Supplies', // Nombre de la tabla en plural
    timestamps: true
});

module.exports = Supply;