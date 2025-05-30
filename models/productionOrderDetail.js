// models/productionOrderDetail.js (ANTES processDetail.js)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrderDetail = sequelize.define('ProductionOrderDetail', {
    idProductionOrderDetail: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    // FKs: idProductionOrder, idProcess, idEmployeeAssigned (opcional al inicio)
    // Estas se añaden por las asociaciones.
    processOrder: { // El número de orden del paso DENTRO de esta orden de producción
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Tomar el nombre y descripción del SpecSheetProcess al momento de crear los detalles de la orden
    // o, si no se usa SpecSheetProcess, del Process maestro.
    processNameSnapshot: {
        type: DataTypes.STRING(150), // Nombre del proceso tal como se definió para esta orden
        allowNull: false
    },
    processDescriptionSnapshot: {
        type: DataTypes.TEXT, // Descripción del proceso tal como se definió para esta orden
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
    status: { // PENDING, IN_PROGRESS, COMPLETED, SKIPPED
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    observations: { // Observaciones específicas de este paso en esta orden
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ProductionOrderDetails',
    timestamps: true
});

module.exports = ProductionOrderDetail;