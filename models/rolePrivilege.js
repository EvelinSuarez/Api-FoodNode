const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Privilege = sequelize.define('rolePrivilege', {
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
    }
}, { timestamps: false });

module.exports = Privilege;
