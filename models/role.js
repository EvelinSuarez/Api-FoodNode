const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Role = sequelize.define('Role', {
    idRole: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    roleName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

module.exports = Role;