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
    actualTimeMinutes: { // AGREGAR ESTE
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Diferencia real calculada entre endDate y startDate'
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

const updateOrderTotals = async (idProductionOrder) => {
    const ProductionOrder = sequelize.models.ProductionOrder;
    
    // Obtenemos las sumas de los detalles
    const totals = await ProductionOrderDetail.findOne({
        where: { idProductionOrder: idProductionOrder },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('estimatedTimeMinutes')), 'totalEst'],
            [sequelize.fn('SUM', sequelize.col('actualTimeMinutes')), 'totalAct']
        ],
        raw: true
    });

    // Actualizamos la cabecera
    await ProductionOrder.update({
        totalEstimatedTime: totals.totalEst || 0,
        totalActualTime: totals.totalAct || 0
    }, {
        where: { idProductionOrder: idProductionOrder }
    });
};

// Hook ANTES de guardar: Calcular el tiempo real del paso
ProductionOrderDetail.beforeSave((detail) => {
    if (detail.startDate && detail.endDate) {
        const start = new Date(detail.startDate);
        const end = new Date(detail.endDate);
        const diffMs = end - start;
        // Convertimos a minutos y usamos Math.ceil para que 30 segundos cuenten como 1 minuto
        detail.actualTimeMinutes = Math.max(1, Math.ceil(diffMs / 60000));
    }
});

// Hooks DESPUÉS de guardar/actualizar: Sincronizar con la cabecera
ProductionOrderDetail.afterSave(async (detail) => {
    await updateOrderTotals(detail.idProductionOrder);
});

ProductionOrderDetail.afterUpdate(async (detail) => {
    await updateOrderTotals(detail.idProductionOrder);
});

module.exports = ProductionOrderDetail;
