// Archivo: models/productionOrderDetail.js

'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrderDetail = sequelize.define('ProductionOrderDetail', {
    idProductionOrderDetail: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // --- Claves Foráneas ---
    idProductionOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ProductionOrders',
            key: 'idProductionOrder'
        }
    },
    idProcess: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Processes',
            key: 'idProcess'
        }
    },
    // --- ESTA ES LA COLUMNA CRUCIAL QUE AÑADIMOS ---
    idEmployeeAssigned: {
        type: DataTypes.INTEGER,
        allowNull: true, // Es 'true' porque un paso puede no tener empleado asignado al inicio
        references: {
            model: 'Employees', // Asegúrate que tu tabla se llame 'Employees'
            key: 'idEmployee'
        }
    },
    // --- Fin de Claves Foráneas ---
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
    estimatedTimeMinutes: {
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