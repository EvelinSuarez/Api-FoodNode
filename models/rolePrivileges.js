/* const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role'); 
const Privileges = require('./privileges');

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
Role.hasMany(RolePrivileges, { foreignKey: 'idRole', onDelete: 'CASCADE' });
RolePrivileges.belongsTo(Privileges, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });
Privileges.hasMany(RolePrivileges, { foreignKey: 'idPrivilege', onDelete: 'CASCADE' });

module.exports = RolePrivileges;  */



const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');
const Privileges = require('./Privileges');

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
            model: Privileges,
            key: 'idPrivilege'
        }
    }
}, { timestamps: false });

RolePrivileges.belongsTo(Role, { foreignKey: 'idRole' });
Role.hasMany(RolePrivileges, { foreignKey: 'idRole' });

RolePrivileges.belongsTo(Privileges, { foreignKey: 'idPrivilege' });
Privileges.hasMany(RolePrivileges, { foreignKey: 'idPrivilege' });

module.exports = RolePrivileges;