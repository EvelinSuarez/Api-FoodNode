const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Process = require('./process');
const ProcessDetail = require('./processDetail');
const Product = require('./Product');

const ProductionOrder = sequelize.define('ProductionOrder', {
    idOrder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idProduct: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Product,
            key: 'idProduct'
        }
    },
    idProcess: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Process,
            key: 'idProcess'
        }
    },
    idProcessDetail: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: ProcessDetail,
            key: 'idProcessDetail'
        }
    },
    initialAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    finalQuantityProduct: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    finishedWeight: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    initialWeight: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

// Definir relaciones
ProductionOrder.belongsTo(Process, { foreignKey: 'idProcess' });
ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct' });
ProductionOrder.belongsTo(ProcessDetail, { foreignKey: 'idProcessDetail' });

module.exports = ProductionOrder;