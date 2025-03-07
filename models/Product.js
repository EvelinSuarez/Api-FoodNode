const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./supplier');

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
    process: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    totalTime: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        comment: 'Tiempo total en minutos' 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    idSupplier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Suppliers',
            key: 'idSupplier'
        }
    }
}, {
    timestamps: true
    
});

// Establecer la relación con Supplier
Product.belongsTo(Supplier, { foreignKey: 'idSupplier' });
Supplier.hasMany(Product, { foreignKey: 'idSupplier' });

module.exports = Product;