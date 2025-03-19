const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SpecSheet = require('./specSheet');
// Assuming ProcessDetail model exists
const ProcessDetail = require('./processDetail');

const Process = sequelize.define('Process', {
    idProcess: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idSpecSheet: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'specSheets',
            key: 'idSpecsheet'
        }
    },
    idProcessDetail: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'ProcessDetails',
            key: 'idProcessDetail'
        }
    }
}, {
    timestamps: true
});

// Establish relationships
Process.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet' });
Process.belongsTo(ProcessDetail, { foreignKey: 'idProcessDetail' });
SpecSheet.hasMany(Process, { foreignKey: 'idSpecSheet' });
ProcessDetail.hasMany(Process, { foreignKey: 'idProcessDetail' });

module.exports = Process;