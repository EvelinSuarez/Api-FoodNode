


// models/privileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Privilege = sequelize.define('privileges', {
    idPrivilege: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    privilegename: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    }
    // Se elimina idPermission de este modelo
}, { timestamps: false });

module.exports = Privilege;