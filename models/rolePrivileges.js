// models/rolePrivileges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// No necesitas importar Role y Privilege aquí si las asociaciones se manejan en index.js

const RolePrivilege = sequelize.define('RolePrivilege', { // Convención: Nombre de modelo PascalCase y singular
    idPrivilegedRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idRole: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles', // Nombre de la TABLA o Modelo importado
            key: 'idRole'
        }
    },
    idPrivilege: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'privileges', // Nombre de la TABLA o Modelo importado
            key: 'idPrivilege'
        }
    }
}, {
    timestamps: false,
    tableName: 'rolePrivileges',
    indexes: [
        {
            unique: true,
            name: 'uq_role_privilege', // Simplificado
            fields: ['idRole', 'idPrivilege']
        }
    ]
});

// ELIMINA ESTAS LÍNEAS DE AQUÍ SI LAS DEFINES EN models/index.js
// RolePrivileges.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
// RolePrivileges.belongsTo(Privilege, { foreignKey: 'idPrivilege', as: 'privilege' });

// Si prefieres el método associate:
/*
RolePrivilege.associate = function(models) {
    RolePrivilege.belongsTo(models.Role, { foreignKey: 'idRole', as: 'role' });
    RolePrivilege.belongsTo(models.Privilege, { foreignKey: 'idPrivilege', as: 'privilege' });
};
*/

module.exports = RolePrivilege; // Exportar el modelo