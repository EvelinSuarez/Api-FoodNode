const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('role', {
    idRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    roleName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

module.exports = Role;