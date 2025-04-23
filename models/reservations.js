const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customers = require('./customers');
const AditionalServices = require('./aditionalServices');

const Reservations = sequelize.define('Reservations', {
    idReservations: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        allowNull: false 
    },
    dateTime: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    numberPeople: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
    },
    matter: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    timeDurationR: { 
        type: DataTypes.TIME, 
        allowNull: false 
    },
    pass: {
        type: DataTypes.JSON, // Debe ser tipo JSON para almacenar arrays
        allowNull: true,
        defaultValue: [] // Valor por defecto como array vacío
    },
    decorationAmount: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    remaining: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    evenType: { 
        type: DataTypes.STRING(60), 
        allowNull: false 
    },
    totalPay: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    paymentMethod: { 
        type: DataTypes.STRING(20), 
        allowNull: false,
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: true 
    },
    idCustomers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customers,
            key: 'idCustomers'
        },
        onDelete: 'CASCADE'
    },
});

// Definir las asociaciones con alias correctos
Reservations.belongsTo(Customers, { 
    foreignKey: 'idCustomers',
    as: 'Customer'  // Este alias es crítico - debe coincidir con lo que espera el frontend
});

Reservations.belongsToMany(AditionalServices, {
    through: 'reservationServices',
    foreignKey: 'idReservations',
    otherKey: 'idAditionalServices',
    as: 'AditionalServices'  // Este alias es crítico - debe coincidir con lo que espera el frontend
});

module.exports = Reservations;