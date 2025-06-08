// models/productionOrderDetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrderDetail = sequelize.define('ProductionOrderDetail', {
    idProductionOrderDetail: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    processOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    processNameSnapshot: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    processDescriptionSnapshot: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedTimeMinutes: { // <--- CAMPO AÑADIDO/RECOMENDADO (Snapshot del tiempo para esta orden/paso)
        type: DataTypes.INTEGER,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ProductionOrderDetails',
    timestamps: true
});

module.exports = ProductionOrderDetail;