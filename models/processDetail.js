const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// We'll handle the circular dependency by importing Process later
// Assuming Employee model exists
const Employee = require('./employee');

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
    }
}, {
    timestamps: true
});

// Establish relationships with Employee
ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee' });
Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee' });

// Handle circular dependency
// We'll set up the Process relationship after exporting
module.exports = ProcessDetail;

// Now import Process and set up the relationship
// This avoids the circular dependency issue
const Process = require('./process');
ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess' });
Process.hasMany(ProcessDetail, { foreignKey: 'idProcess', as: 'Details' });