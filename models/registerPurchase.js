// models/registerPurchase.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa la instancia

const RegisterPurchase = sequelize.define('RegisterPurchase', {
    idRegisterPurchase: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idProvider: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // ÚNICA DEFINICIÓN DE CATEGORY
    category: {
            type: DataTypes.STRING,
            allowNull: false // Sigue siendo obligatorio
    },
    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDIENTE' // 'PENDIENTE' o 'ACTIVO' o lo que necesites
    }
    // }, {
    // timestamps: true // Descomenta si usas timestamps
});

module.exports = RegisterPurchase;