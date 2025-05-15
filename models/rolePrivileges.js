'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Importar modelos relacionados
const Role = require('./role');        // Modelo Role
const Privilege = require('./privilege');  // Modelo Privilege
const Permission = require('./permission'); // Modelo Permission

// Definición del modelo RolePrivileges
const RolePrivileges = sequelize.define('rolePrivileges', {
    idPrivilegedRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idRole: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role,
            key: 'idRole'
        }
    },
    idPrivilege: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Privilege,
            key: 'idPrivilege'
        }
    },
    idPermission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Permission,
            key: 'idPermission'
        }
    }
}, {
    timestamps: false,
    tableName: 'rolePrivileges',
    indexes: [
        {
            unique: true,
            name: 'uq_role_permission_privilege',
            fields: ['idRole', 'idPrivilege', 'idPermission']
        }
    ]
});

// Asociaciones belongsTo
RolePrivileges.belongsTo(Role, {
    foreignKey: 'idRole',
    as: 'role' // Relación con Role
});

RolePrivileges.belongsTo(Privilege, {
    foreignKey: 'idPrivilege',
    as: 'privilege' // Relación con Privilege
});

RolePrivileges.belongsTo(Permission, {
    foreignKey: 'idPermission',
    as: 'permission' // Relación con Permission
});

// Exportar el modelo
module.exports = RolePrivileges;