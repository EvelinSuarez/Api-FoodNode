const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role'); // Asegúrate de que la ruta es correcta
const Privileges = require('./privileges');

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
Role.hasMany(RolePrivileges, { foreignKey: 'idRole', onDelete: 'CASCADE' });

module.exports = RolePrivileges;
