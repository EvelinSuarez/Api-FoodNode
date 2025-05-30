// models/specSheetSupply.js (ANTES productSheet.js)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecSheetSupply = sequelize.define('SpecSheetSupply', {
    idSpecSheetSupply: { // PK para la tabla intermedia
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idSpecSheet (FK) se añade por asociación
    // idSupply (FK) se añade por asociación
    quantity: { // Cantidad del insumo requerida por la ficha (para quantityBase del producto)
        type: DataTypes.DECIMAL(10, 3), // Ej: 0.500 kg de harina
        allowNull: false
    },
    measurementUnit: { // Unidad del insumo en esta receta (puede ser diferente a la unidad base del insumo)
        type: DataTypes.STRING(50), // Ej: "gramos", "ml", "cucharadas"
        allowNull: false
    },
    notes: { // Notas adicionales sobre este ingrediente en la receta
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'SpecSheetSupplies',
    timestamps: true // Puede ser útil saber cuándo se añadió/modificó un ingrediente en la ficha
});

module.exports = SpecSheetSupply;