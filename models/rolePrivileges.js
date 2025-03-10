


// models/rolePrivileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Privilege = require('./privileges');
const Permission = require('./permission');

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
}, { timestamps: false });

// Relaciones
RolePrivileges.belongsTo(Role, { foreignKey: 'idRole' });
Role.hasMany(RolePrivileges, { foreignKey: 'idRole' });

RolePrivileges.belongsTo(Privilege, { foreignKey: 'idPrivilege' });
Privilege.hasMany(RolePrivileges, { foreignKey: 'idPrivilege' });

RolePrivileges.belongsTo(Permission, { foreignKey: 'idPermission' });
Permission.hasMany(RolePrivileges, { foreignKey: 'idPermission' });

module.exports = RolePrivileges;