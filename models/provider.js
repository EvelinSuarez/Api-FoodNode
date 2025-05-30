const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Provider = sequelize.define('Provider', { // Este modelo representa a la Empresa Proveedora
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
        type: DataTypes.STRING(20), // Cambiado a STRING para documentos con letras/guiones
        allowNull: false,
        unique: true // Un documento debería ser único
    },
    company: { // Nombre de la empresa proveedora
        type: DataTypes.STRING(250),
        allowNull: false
    },
    cellPhone: {
        type: DataTypes.STRING(20), // Cambiado a STRING para teléfonos con formatos
        allowNull: true // Podría no ser obligatorio
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'Providers' // Pluralizado
});

module.exports = Provider;