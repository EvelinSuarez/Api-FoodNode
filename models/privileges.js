const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permissions');
const RolePrivileges = require('./rolePrivileges');

const Privileges = sequelize.define('Privileges', {
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
            model: Permission, 
            key: 'idPermission' 
        }
    },
}, { timestamps: false });

RolePrivileges.belongsTo(Privileges, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });

module.exports = Privileges;