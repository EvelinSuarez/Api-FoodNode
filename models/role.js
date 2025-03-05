const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('role', {
    idRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    roleName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

module.exports = Role;