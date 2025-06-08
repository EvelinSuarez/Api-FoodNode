const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    idProduct: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    productName: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    // NUEVO: Campo para el stock mínimo del producto/insumo
    minStock: {
        type: DataTypes.INTEGER,
        allowNull: true, // Permitimos que sea nulo si no se especifica
        defaultValue: 0,
        validate: {
            min: 0 // El valor no puede ser negativo
        }
    },
    // NUEVO: Campo para el stock máximo del producto/insumo
    maxStock: {
        type: DataTypes.INTEGER,
        allowNull: true, // Permitimos que sea nulo si no se especifica
        defaultValue: 0,
        validate: {
            min: 0 // El valor no puede ser negativo
        }
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
}, {
    timestamps: true
});

module.exports = Product;