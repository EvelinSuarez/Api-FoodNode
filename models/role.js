const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission');
const Privilege = require('./rolePrivilege');

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

Role.belongsToMany(Permission, { through: 'RolePermissionPrivilege', foreignKey: 'idRole', onDelete: 'CASCADE' });
Role.belongsToMany(Privilege, { through: 'RolePermissionPrivilege', foreignKey: 'idRole', onDelete: 'CASCADE' });

module.exports = Role;