const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessDetail = sequelize.define('ProcessDetail', {
    idProcessDetail: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idProcess: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Processes',
            key: 'idProcess'
        }
    },
    idSpecSheet: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'specSheets',
            key: 'idSpecsheet'
        }
    },
    idEmployee: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Employees',
            key: 'idEmployee'
        }
    },
    startDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    endDate: { 
        type: DataTypes.DATE, 
        allowNull: true 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, {
    timestamps: true,
    tableName: 'ProcessDetails'
});

module.exports = ProcessDetail;