// models/specSheetSupply.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecSheetSupply = sequelize.define('SpecSheetSupply', {
    idSpecSheetSupply: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    
    // --- CAMBIO: Definir FKs explícitamente ---
    idSpecSheet: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SpecSheets',
            key: 'idSpecSheet'
        }
    },
    idSupply: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'supplies', // Asegúrate que el nombre de la tabla sea correcto
            key: 'idSupply'
        }
    },
    // --- FIN DEL CAMBIO ---

    idPurchaseDetail: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'PurchaseDetails',
            key: 'idPurchaseDetail'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    unitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'SpecSheetSupplies',
    timestamps: true
});

module.exports = SpecSheetSupply;