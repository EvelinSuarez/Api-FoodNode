const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const SpecSheet = sequelize.define('specSheets', {
    idSpecsheet: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idProduct: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'idProduct'
        }
    },
    startDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    endDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    timestamps: true
});

// Establecer la relación con Product
SpecSheet.belongsTo(Product, { foreignKey: 'idProduct' });
Product.hasMany(SpecSheet, { foreignKey: 'idProduct' });

module.exports = SpecSheet;