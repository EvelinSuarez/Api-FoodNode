const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Permission = require('./permission');

const Privilege = sequelize.define('privileges', {
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
            model: Permission,
            key: 'idPermission'
        }
    }
}, { timestamps: false });

Privilege.belongsTo(Permission, { foreignKey: "idPermission" })
Permission.hasMany(Privilege, { foreignKey: "idPermission" })

module.exports = Privilege;