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
    // NUEVO: Cantidad actual en inventario
    currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false, // Es importante que siempre tenga un valor
        defaultValue: 0,
        validate: {
            min: 0 // El stock no puede ser negativo
        }
    },
    stockForSale: { // Este es "Stock de Producto Terminado"
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0, // Inicia en 0 como pediste
    },  
    minStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    maxStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
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