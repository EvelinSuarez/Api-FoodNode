const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductionOrder = require('./productionOrder'); // Necesario para la FK
const Process = require('./process');
const SpecSheet = require('./specSheet');
const Employee = require('./employee');

const ProcessDetail = sequelize.define('ProcessDetail', {
    idProcessDetail: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    idProductionOrder: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: ProductionOrder, key: 'idOrder' } // Puedes definir references aquí
    },
    idProcess: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: Process, key: 'idProcess' }
    },
    idSpecSheet: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: SpecSheet, key: 'idSpecsheet' }
    },
    idEmployee: {
        type: DataTypes.INTEGER, allowNull: true,
        references: { model: Employee, key: 'idEmployee' }
    },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING' }
}, { tableName: 'ProcessDetails', timestamps: true });

module.exports = ProcessDetail; // Exporta el modelo directamente