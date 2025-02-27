const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AditionalServices = sequelize.define('AditionalServices', {
    idAditionalServices: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    name: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

module.exports = AditionalServices; 