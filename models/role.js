const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permissions');
const Privileges = require('./Privileges');

const Role = sequelize.define('role', {
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
    },privileges:{type:DataTypes.ARRAY(Privileges)

    },
}, { timestamps: false });

Role.belongsToMany(Permission, { through: 'RolePermissionPrivilege', foreignKey: 'idRole', onDelete: 'CASCADE' });
Role.belongsToMany(Privilege, { through: 'RolePermissionPrivilege', foreignKey: 'idRole', onDelete: 'CASCADE' });

module.exports = Role;