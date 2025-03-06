const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

const Product = sequelize.define('product', {
    IdProduct: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    productName: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    process: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    totalTime: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        comment: 'Tiempo total en minutos' 
    },
    state: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    IdSupplier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Suppliers',
            key: 'IdSupplier'
        }
    }
}, {
    timestamps: true
});

// Establecer la relación con Supplier
Product.belongsTo(Supplier, { foreignKey: 'IdSupplier' });
Supplier.hasMany(Product, { foreignKey: 'IdSupplier' });

module.exports = Product;