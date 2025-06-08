// models/productionOrderSupply.js (NUEVO ARCHIVO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrderSupply = sequelize.define('ProductionOrderSupply', {
    idProductionOrderSupply: { // PK para la tabla intermedia
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idProductionOrder (FK) se añade por asociación
    // idSupply (FK) se añade por asociación
    quantityConsumed: { // Cantidad del insumo que REALMENTE se consumió
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    // unitOfMeasureConsumed: Puedes registrar la unidad si puede variar o tomarla del Supply.
    // Por simplicidad, se asume que es la misma unidad base del Supply.
    notes: { // Notas sobre este consumo específico
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ProductionOrderSupplies',
    timestamps: true // Para saber cuándo se registró el consumo
});

module.exports = ProductionOrderSupply;