const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('permission', {
    idPermission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    permissionName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

module.exports = Permission;