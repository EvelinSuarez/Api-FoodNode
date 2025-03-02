const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission');

const Privilege = sequelize.define('Privilege', {
    idPrivilege: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idPermission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Permission,
            key: 'idPermission'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    privilege_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
});

module.exports = Privilege;
