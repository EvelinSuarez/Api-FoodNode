// models/product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    idProduct: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: true
    // tableName: 'Products' // Opcional si Sequelize lo pluraliza bien
});

module.exports = Product; // SOLO EXPORTA EL MODELO DEFINIDO