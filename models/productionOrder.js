// models/productionOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Tu instancia de sequelize

const ProductionOrder = sequelize.define('ProductionOrder', {
    idOrder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idProduct: {
        type: DataTypes.INTEGER, // FK a Product
        allowNull: false // O true, dependiendo de tu lógica
        // SIN 'references' aquí
    },
    idSpecSheet: {
        type: DataTypes.INTEGER, // FK a SpecSheet
        allowNull: false // O true
        // SIN 'references' aquí
    },
    dateTimeCreation: {
        type: DataTypes.DATE,
        allowNull: true, // O defaultValue: DataTypes.NOW
    },
    initialAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    finalQuantityProduct: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    finishedWeight: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    // initialWeight: { // Si necesitas este campo
    //     type: DataTypes.DOUBLE,
    //     allowNull: true
    // },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN, // O STRING para más estados
        allowNull: false,
        defaultValue: true // O un estado inicial como 'PENDING' si es STRING
    }
    // NO idProcessDetail aquí, esa relación la maneja ProcessDetail
}, {
    tableName: 'ProductionOrders', // Opcional
    timestamps: true
});

// ----- ELIMINAR ASOCIACIONES DE AQUÍ -----
// ProductionOrder.belongsTo(models.Product, ...); // QUITAR
// ProductionOrder.belongsTo(models.SpecSheet, ...); // QUITAR
// ProductionOrder.hasMany(models.ProcessDetail, ...); // QUITAR

// YA NO necesitas importar Product, SpecSheet, ProcessDetail aquí si solo eran para asociaciones

module.exports = ProductionOrder;