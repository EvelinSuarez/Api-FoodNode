


// models/privileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Privilege = sequelize.define('privilege', {
    idPrivilege: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },privilegeName
    : {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
    // Se elimina idPermission de este modelo
});

module.exports = Privilege;