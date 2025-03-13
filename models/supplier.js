const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
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
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
});

module.exports = Supplier;