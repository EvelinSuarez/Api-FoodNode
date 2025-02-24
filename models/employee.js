const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
    idEmployee: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    typeDocument: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    document: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    fullName: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    dateOfEntry: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    emergencyContact: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    Relationship: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    nameFamilyMember: { 
        type: DataTypes.STRING(255), 
        allowNull: true 
    },
    BloodType: { 
        type: DataTypes.STRING(10), 
        allowNull: true 
    },
    socialSecurityNumber: { 
        type: DataTypes.STRING(20), 
        allowNull: true 
    },
    Address: { 
        type: DataTypes.STRING(255), 
        allowNull: true 
    },
    contractType: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

module.exports = Employee;
