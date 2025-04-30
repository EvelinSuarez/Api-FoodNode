// models/permission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('permission', {
    idPermission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    permissionName: { // Nombre legible del permiso
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true // El nombre también podría ser único si deseas
    },
    permissionKey: { // Clave única del permiso
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true // La clave DEBE ser única
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['permissionKey'], // Índice único para permissionKey
        },
    ],
});

module.exports = Permission;
