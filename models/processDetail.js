const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Process = require('./Process');
const SpecSheet = require('./SpecSheet');
const Employee = require('./Employee');

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

// Definir asociaciones
ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess' });
ProcessDetail.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet' });
ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee' });

Process.hasMany(ProcessDetail, { foreignKey: 'idProcess' });
SpecSheet.hasMany(ProcessDetail, { foreignKey: 'idSpecSheet' });
Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee' });

module.exports = ProcessDetail;