// models/privileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Privilege = sequelize.define('privilege', {
    idPrivilege: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    privilegeName: { // Nombre legible
        type: DataTypes.STRING,
        allowNull: false
        // unique: true // Podría ser único también
    },
    privilegeKey: { // <--- ¡AÑADIR ESTO!
        type: DataTypes.STRING(50), // Ajusta longitud
        allowNull: false,
        unique: true // La clave DEBE ser única
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: false
});

module.exports = Privilege;