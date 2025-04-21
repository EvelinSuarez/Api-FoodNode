// models/purchaseDetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// No necesitas importar modelos aquí si las asociaciones se definen centralmente

const PurchaseDetail = sequelize.define('PurchaseDetail', {
    idPurchaseDetail: { // Renombrado para claridad
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // idRegisterPurchase será añadido por la asociación
    // idSupplier (representando el INSUMO) será añadido por la asociación
    quantity: {
        type: DataTypes.DECIMAL(10, 2), // Permite decimales si es necesario (kg, litros)
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2), // Precio unitario
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2), // Cantidad * Precio Unitario
        allowNull: false
    }
    // Quitamos status de aquí
    // Timestamps podrían ser útiles si quieres saber cuándo se añadió/modificó una línea
    // }, {
    // timestamps: true
});

// Asociaciones se definen centralmente

module.exports = PurchaseDetail;