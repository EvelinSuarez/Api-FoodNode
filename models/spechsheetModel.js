const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const SpecSheet = sequelize.define('spechsheetModel', {
    IdSpecsheet: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    IdProduct: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'IdProduct'
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
    state: { 
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
SpecSheet.belongsTo(Product, { foreignKey: 'IdProduct' });
Product.hasMany(SpecSheet, { foreignKey: 'IdProduct' });

module.exports = SpecSheet;