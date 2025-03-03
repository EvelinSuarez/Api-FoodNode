const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Permission = require('./permission');
const Privilege = require('./rolePrivilege');

const RolePermissionPrivilege = sequelize.define('RolePermissionPrivilege', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idRole: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: Role, key: 'idRole' },
        onDelete: 'CASCADE'
    },
    idPermission: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: Permission, key: 'idPermission' },
        onDelete: 'CASCADE'
    },
    idPrivilege: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: Privilege, key: 'idPrivilege' },
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

RolePermissionPrivilege.belongsTo(Role, { foreignKey: 'idRole', onDelete: 'CASCADE' });
RolePermissionPrivilege.belongsTo(Permission, { foreignKey: 'idPermission', onDelete: 'CASCADE' });
RolePermissionPrivilege.belongsTo(Privilege, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });

module.exports = RolePermissionPrivilege;
