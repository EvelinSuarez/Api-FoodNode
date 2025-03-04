const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Privileges = require('./Privileges');

const RolePrivileges = sequelize.define('rolePrivileges', {
    idPrivilegedRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idRole: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role,
            key: 'idRole'
        },
        onDelete: 'CASCADE'
    },
    idPrivilege: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Privileges,
            key: 'idPrivilege'
        },
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

RolePrivileges.belongsTo(Role, { foreignKey: 'idRole', onDelete: 'CASCADE' });
RolePrivileges.belongsTo(Privilege, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });

module.exports = RolePrivileges;
