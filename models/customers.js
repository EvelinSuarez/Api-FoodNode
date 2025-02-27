const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customers = sequelize.define('Customers', {
    idCustomers: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    fullName: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    distintive: { 
        type: DataTypes.STRING(30), 
        allowNull: false 
    },
    customerCategory: { 
        type: DataTypes.STRING(80), 
        allowNull: false 
    },
    cellphone: { 
        type: DataTypes.INTEGER(15), 
        allowNull: true 
    },
    email: { 
        type: DataTypes.STRING(120), 
        allowNull: true 
    },
    address: { 
        type: DataTypes.STRING(120), 
        allowNull: true 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

module.exports = Customers; 