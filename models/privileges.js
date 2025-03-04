const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permissions = require('./permissions');
const RolePrivileges = require('./rolePrivileges');

const Privileges = sequelize.define('privileges', {
    idPrivilege: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    privilegeName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    idPermission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
            model: Permissions, 
            key: 'idPermission' 
        }
    },
}, { timestamps: false });

RolePrivileges.belongsTo(Privileges, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });

module.exports = Privileges;