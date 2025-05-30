// models/PurchaseDetail.js (Ejemplo de cómo debería ser la FK)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseDetail = sequelize.define('PurchaseDetail', {
    idPurchaseDetail: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idRegisterPurchase FK se define por la asociación
    idSupply: { // <--- ESTA ES LA FK AL INSUMO
        type: DataTypes.INTEGER,
        allowNull: false,
        // No necesitas 'references' aquí si la asociación se define en models/index.js
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        validate: { min: 0.001 }
    },
    unitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    // ... (taxRate, taxAmount, discountPercentage, discountAmount, itemTotal como los tenías)
    taxRate: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.0000 },
    taxAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
    discountPercentage: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.0000 },
    discountAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
    itemTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, {
    timestamps: true,
    tableName: 'PurchaseDetails',
    // models/PurchaseDetail.js
hooks: {
    beforeValidate: (detail) => {
        const quantity = Number(detail.quantity);
        const unitPrice = Number(detail.unitPrice);

        // Loguea el objeto 'detail' COMPLETO tal como llega al hook
        console.log(`\n--- DEBUG PurchaseDetail Hook (beforeValidate) ---`);
        console.log(`Detail ANTES de procesar:`, JSON.stringify(detail, null, 2));
        console.log(`Valores Originales: quantity='${detail.quantity}' (tipo ${typeof detail.quantity}), unitPrice='${detail.unitPrice}' (tipo ${typeof detail.unitPrice})`);
        console.log(`Valores Numéricos: quantity=${quantity}, unitPrice=${unitPrice}`);

        if (!isNaN(quantity) && !isNaN(unitPrice) && quantity > 0 && unitPrice >= 0) {
            detail.subtotal = parseFloat((quantity * unitPrice).toFixed(2));
            
            const taxRate = Number(detail.taxRate || 0);
            const discountPercentage = Number(detail.discountPercentage || 0);

            detail.taxAmount = parseFloat((detail.subtotal * taxRate).toFixed(2));
            detail.discountAmount = parseFloat((detail.subtotal * discountPercentage).toFixed(2));
            detail.itemTotal = parseFloat((detail.subtotal + detail.taxAmount - detail.discountAmount).toFixed(2));
            
            console.log(`CONDICIÓN CUMPLIDA - Subtotal CALCULADO: ${detail.subtotal}, ItemTotal: ${detail.itemTotal}`);
        } else {
            console.warn(`WARN: CONDICIÓN NO CUMPLIDA para calcular subtotal. Qty (num): ${quantity}, Price (num): ${unitPrice}. Subtotal se establecerá a 0.`);
            detail.subtotal = 0.00;
            detail.taxAmount = 0.00;
            detail.discountAmount = 0.00;
            detail.itemTotal = 0.00;
        }
        console.log(`Detail DESPUÉS de procesar:`, JSON.stringify(detail, null, 2));
        console.log(`--- FIN DEBUG PurchaseDetail Hook ---\n`);
    }
}

});

module.exports = PurchaseDetail;