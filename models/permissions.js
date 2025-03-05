const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permissions = sequelize.define('permissions', {
    idPermission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    permissionName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    }
}, { timestamps: false });

module.exports = Permissions;