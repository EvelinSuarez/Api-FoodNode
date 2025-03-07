const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Privilege = require('./privileges');

const RolePrivileges = sequelize.define('RolePrivileges', {
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
    }
}, { timestamps: false });

RolePrivileges.belongsTo(Role, { foreignKey: 'idRole' });
Role.hasMany(RolePrivileges, { foreignKey: 'idRole' });

RolePrivileges.belongsTo(Privilege, { foreignKey: 'idPrivilege' });
Privilege.hasMany(RolePrivileges, { foreignKey: 'idPrivilege' });

module.exports = RolePrivileges;