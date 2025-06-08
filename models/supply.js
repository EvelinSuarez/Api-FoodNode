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
    // <<<--- NUEVO CAMPO AÑADIDO AQUÍ --- >>>
    // Este campo almacenará el precio de la última compra para este insumo.
    lastPrice: {
        type: DataTypes.DECIMAL(10, 2), // Usamos DECIMAL para precisión monetaria
        allowNull: true, // Puede ser nulo si nunca se ha comprado
        defaultValue: 0.00 // Un valor por defecto seguro
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    tableName: 'supplies', // Nombre de la tabla en plural
    timestamps: true
});

module.exports = Supply;