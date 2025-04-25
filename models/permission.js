// models/permission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('permission', {
    idPermission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    permissionName: { // Nombre legible
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true // El nombre también podría ser único
    },
    permissionKey: { // <--- ¡AÑADIR ESTO!
        type: DataTypes.STRING(50), // Ajusta longitud según tus keys
        allowNull: false,
        unique: true // La clave DEBE ser única
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

module.exports = Permission;