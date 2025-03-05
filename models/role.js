


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission');
const Privilege = require('./rolePrivilege');

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
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

module.exports = Role;