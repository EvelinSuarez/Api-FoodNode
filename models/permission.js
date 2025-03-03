const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    idPermission: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    permissionName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    }
}, { timestamps: false });

module.exports = Permission;