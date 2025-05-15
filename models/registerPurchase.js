// models/registerPurchase.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa la instancia

const RegisterPurchase = sequelize.define('RegisterPurchase', {
    idRegisterPurchase: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // *** AÑADIDO EXPLÍCITAMENTE: Definición de la columna FK ***
    idProvider: {
        type: DataTypes.INTEGER, // Debe coincidir con el tipo de la PK en Provider
        allowNull: false,
        // No necesitas 'references' aquí si lo defines en la asociación central
        // references: {
        //   model: 'Providers', // Nombre de la tabla referenciada
        //   key: 'idProvider'   // Clave primaria referenciada
        // }
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    category: {
            type: DataTypes.STRING,
            allowNull: false
    },

    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    category: {
            type: DataTypes.STRING,
            allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDIENTE'
    }
    // }, {
    // timestamps: true // Descomenta si usas timestamps
});

// La asociación en models/index.js completará la configuración de la FK.
// RegisterPurchase.belongsTo(Provider, { foreignKey: 'idProvider', ... });

module.exports = RegisterPurchase;