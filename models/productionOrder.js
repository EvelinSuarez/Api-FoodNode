// models/productionOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrder = sequelize.define('ProductionOrder', {
    idProductionOrder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // FKs: idProduct, idSpecSheet, idEmployeeRegistered, idProvider (opcional)
    // Se añaden por asociaciones en models/index.js
    orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true // Considerar si realmente debe ser único o si puede autogenerarse de forma no estricta
    },
    dateTimeCreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    productNameSnapshot: { // Nombre del producto en el momento de la creación/última actualización
        type: DataTypes.STRING(255),
        allowNull: true // Permitir null si el producto se deselecciona temporalmente en UI antes de guardar
    },
    initialAmount: { // Cantidad de producto que se planea producir (unidades/porciones del producto final)
        type: DataTypes.INTEGER,
        allowNull: false // Debe tener un valor, incluso si es un default como 1
    },
    // Peso inicial del material principal, registrado por el empleado
    inputInitialWeight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true
    },
    inputInitialWeightUnit: {
        type: DataTypes.STRING(50),
        allowNull: true // Ej: "kg", "lb", "g"
    },
    // --- Datos de finalización ---
    finalQuantityProduct: { // Cantidad de producto final REALMENTE obtenida (unidades/porciones)
        type: DataTypes.INTEGER,
        allowNull: true
    },
    finishedProductWeight: { // Peso total final de TODAS las unidades/porciones de producto OBTENIDAS
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true
    },
    finishedProductWeightUnit: { // Unidad para finishedProductWeight
        type: DataTypes.STRING(50),
        allowNull: true
    },
    // Peso final del insumo principal que NO se convirtió en producto (merma directa)
    inputFinalWeightUnused: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true
    },
    inputFinalWeightUnusedUnit: { // Unidad para inputFinalWeightUnused
        type: DataTypes.STRING(50),
        allowNull: true
    },
    // --- Fin Datos de finalización ---
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: { // PENDING, SETUP, SETUP_COMPLETED, IN_PROGRESS, PAUSED, ALL_STEPS_COMPLETED, COMPLETED, CANCELLED
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING' // Estado inicial por defecto al crear la orden "borrador"
    },
    // idEmployeeRegistered es una FK que se define en la asociación
}, {
    tableName: 'ProductionOrders',
    timestamps: true // createdAt, updatedAt
});

module.exports = ProductionOrder;