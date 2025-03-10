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
        type: DataTypes.FLOAT, 
        allowNull: false 
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
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    },
    idCustomers: { 
        type: DataTypes.INTEGER, references: { model: Customers, key: 'idCustomers' } 
    },
    idAditionalServices: { 
        type: DataTypes.INTEGER, references: { model: AditionalServices, key: 'idAditionalServices' } 
    },
});


// Relación con Customer y services
Reservations.belongsTo(Customers, { foreignKey: 'idCustomers' });
Customers.hasMany(Reservations, { foreignKey: 'idCustomers' });

Reservations.belongsTo(AditionalServices, { foreignKey: 'idAditionalServices' });
AditionalServices.hasMany(Reservations, { foreignKey: 'idAditionalServices' });


module.exports = Reservations;