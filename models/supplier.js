const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suppliers = sequelize.define('Supplier', {
    IdSupplier: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    supplierName: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    IdProvider: { 
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    state: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    Gramaje: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    }
}, {
    timestamps: true
});

module.exports = Suppliers;