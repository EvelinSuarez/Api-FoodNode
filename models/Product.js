// models/Product.js
// --- VERSIÓN CORREGIDA SIN PROFIT MARGIN ---

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
    // Este campo ahora representa el COSTO POR UNIDAD del producto intermedio.
    sellingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        },
        comment: 'Costo de producción por unidad de medida base (ej: costo por kg).'
    },
    currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    stockForSale: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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
    // --- CAMPO ELIMINADO ---
    // El campo profitMargin se elimina ya que el precio se basa en el costo directo.
    
}, {
    timestamps: true
});

module.exports = Product;