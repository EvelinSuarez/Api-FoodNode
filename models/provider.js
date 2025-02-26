const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Provider = sequelize.define('Provider', {
    idProvider: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    documentType: { 
        type: DataTypes.STRING(30), 
        allowNull: false 
    },
    document: { 
        type: DataTypes.INTEGER(15), 
        allowNull: false 
    },
    cellPhone: { 
        type: DataTypes.INTEGER(15), 
        allowNull: false 
    },
    company: { 
        type: DataTypes.STRING(250), 
        allowNull: false 
    },
    state: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

module.exports = Provider;
