const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SpecSheet = require('./specSheet');
const Supplier = require('./supplier');

const ProductSheet = sequelize.define('ProductSheet', {
    idProductSheet: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idSpecSheet: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'specSheets',
            key: 'idSpecsheet'
        }
    },
    idSupplier: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Suppliers',
            key: 'idSupplier'
        }
    },
    measurementUnit: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    quantity: { 
        type: DataTypes.STRING(30), 
        allowNull: false 
    }
}, {
    timestamps: true
});

// Establish relationships
ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet' });
ProductSheet.belongsTo(Supplier, { foreignKey: 'idSupplier' });
SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet' });
Supplier.hasMany(ProductSheet, { foreignKey: 'idSupplier' });

module.exports = ProductSheet;