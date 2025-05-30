const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define las categorías permitidas. Haz esta lista tan extensa como necesites.
const ALLOWED_CATEGORIES = ['CARNE', 'VEGETALES', 'LACTEOS', 'FRUTAS', 'ABARROTES', 'LIMPIEZA', 'BEBIDAS', 'CONGELADOS', 'OTROS'];

const RegisterPurchase = sequelize.define('RegisterPurchase', {
    idRegisterPurchase: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // idProvider FK se definirá por la asociación en models/index.js
    invoiceNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    receptionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM(...ALLOWED_CATEGORIES), // Usar ENUM para restringir valores
        allowNull: false,
        validate: {
            notEmpty: { msg: "La categoría de la compra no puede estar vacía." },
            isIn: {
                args: [ALLOWED_CATEGORIES],
                msg: `La categoría debe ser una de las siguientes: ${ALLOWED_CATEGORIES.join(', ')}.`
            }
        }
    },
    subtotalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    // totalTaxAmount eliminado
    // totalDiscountAmount eliminado
    totalAmount: { // Este será igual al subtotalAmount si no hay más lógica de impuestos/descuentos
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING(30), // Considerar ENUM aquí también para consistencia
        allowNull: false,
        defaultValue: 'PENDIENTE',
        validate: {
            isIn: [['PENDIENTE', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA', 'PAGADA', 'CANCELADA']]
        }
    },
    paymentStatus: {
        type: DataTypes.STRING(30), // Considerar ENUM aquí también
        allowNull: false,
        defaultValue: 'NO_PAGADA',
        validate: {
            isIn: [['NO_PAGADA', 'PAGADA_PARCIAL', 'PAGADA']]
        }
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'RegisterPurchases',
    hooks: {
        // Un hook para asegurar que totalAmount se calcule si es necesario
        // Aunque el servicio también lo hace, esto puede ser una salvaguarda
        beforeValidate: (purchase) => {
            if (purchase.subtotalAmount && (purchase.totalAmount === 0.00 || purchase.totalAmount !== purchase.subtotalAmount)) {
                 // Dado que hemos eliminado tax y discount, totalAmount es igual a subtotalAmount
                purchase.totalAmount = purchase.subtotalAmount;
            }
        }
    }
});

// Exportar también las categorías permitidas si se necesitan en otros lugares (ej. validaciones)
RegisterPurchase.ALLOWED_CATEGORIES = ALLOWED_CATEGORIES;

module.exports = RegisterPurchase;