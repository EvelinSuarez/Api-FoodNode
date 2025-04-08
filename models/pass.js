// models/pass.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pass = sequelize.define('Pass', {
    idPass: { // O simplemente id
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    idReservation: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reservations', // Nombre tabla Reservations
            key: 'idReservations'
        }
    },
    paymentDate: { // Nombre en inglés para fecha
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    amount: { // Nombre en inglés para cantidad
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'pass', // Nombre tabla en inglés
    timestamps: true
});

module.exports = Pass;