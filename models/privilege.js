// models/privileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission'); // Asegúrate de que la ruta es correcta

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
    idPermission: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Permission, // Asegúrate que 'Permission' es el modelo Sequelize importado
                key: 'idPermission'
            }
        },

    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    
}, {
    timestamps: false
});

module.exports = Privilege;