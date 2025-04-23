// models/privileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Privilege = sequelize.define('privilege', {
    idPrivilege: { // El atributo que causa el error
        type: DataTypes.INTEGER, // <-- ASEGÚRATE QUE ESTÉ ASÍ
        primaryKey: true,
        autoIncrement: true,
        allowNull: false // Generalmente las PK no son nulas
    },
    privilegeName: { // Ejemplo de otro campo
        type: DataTypes.STRING,
        allowNull: false
    },
    // ... otros atributos de tu modelo privilege ...
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    // Opciones del modelo (timestamps, tableName, etc.)
    timestamps: false // O true si usas createdAt/updatedAt
});

module.exports = Privilege;