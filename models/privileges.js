/* const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permissions = require('./permissions');
const RolePrivileges = require('./rolePrivileges');

const Privileges = sequelize.define('privileges', {
    idPrivilege: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
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

RolePrivileges.belongsTo(Permissions, { foreignKey: 'idPermission' });
Privileges.hasMany(RolePrivileges, { foreignKey: 'idPrivilege' });

module.exports = Privileges; */


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permissions = require('./permissions');

const Privileges = sequelize.define('Privileges', {
    idPrivilege: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    }
}, { timestamps: false });

module.exports = Privileges;