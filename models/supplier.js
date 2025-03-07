const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suppliers = sequelize.define('supplier', {
    idSupplier: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    supplierName: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    idProvider: { 
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    gramaje: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    }
}, {
    timestamps: true
});

module.exports = Suppliers;