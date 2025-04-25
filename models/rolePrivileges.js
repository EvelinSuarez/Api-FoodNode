const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Privilege = require('./privilege');
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
}, {
    timestamps: false
});

// Relaciones SIN alias duplicados
RolePrivileges.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
Role.hasMany(RolePrivileges, { foreignKey: 'idRole', as: 'rolePrivilegesList' });

RolePrivileges.belongsTo(Privilege, { foreignKey: 'idPrivilege', as: 'privilege' });
Privilege.hasMany(RolePrivileges, { foreignKey: 'idPrivilege', as: 'privilegeAssignments' });

RolePrivileges.belongsTo(Permission, { foreignKey: 'idPermission', as: 'permission' });
Permission.hasMany(RolePrivileges, { foreignKey: 'idPermission', as: 'permissionAssignments' });

module.exports = RolePrivileges;
