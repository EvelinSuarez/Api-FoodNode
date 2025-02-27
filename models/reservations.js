// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Customers = require('./customers');
// const AditionalServices = require('./aditionalServices');


// const Reserves = sequelize.define('Reserves', {
//     idReserves: { 
//         type: DataTypes.INTEGER, 
//         primaryKey: true, 
//         autoIncrement: true 
//     },
//     dateTime: { 
//         type: DataTypes.DATE, 
//         allowNull: false 
//     },
//     numberPeople: { 
//         type: DataTypes.INTEGER, 
//         allowNull: false,
//     },
//     matter: { 
//         type: DataTypes.STRING(100), 
//         allowNull: false 
//     },
//     timeDurationR: { 
//         type: DataTypes.TIME, 
//         allowNull: false 
//     },
//     pass: { 
//         type: DataTypes.FLOAT, 
//         allowNull: false 
//     },
//     decorationAmount: { 
//         type: DataTypes.FLOAT, 
//         allowNull: false 
//     },
//     remaining: { 
//         type: DataTypes.FLOAT, 
//         allowNull: false 
//     },
//     evenType: { 
//         type: DataTypes.STRING(60), 
//         allowNull: false 
//     },
//     totalPay: { 
//         type: DataTypes.FLOAT, 
//         allowNull: false 
//     },
//     paymentMethod: { 
//         type: DataTypes.STRING(20), 
//         allowNull: false,
//     },
//     state: { 
//         type: DataTypes.BOOLEAN, 
//         defaultValue: true 
//     },
//     idCustomers: { 
//         type: DataTypes.INTEGER, references: { model: Customers, key: 'id' } 
//     },
//     idAditionalServices: { 
//         type: DataTypes.INTEGER, references: { model: AditionalServices, key: 'id' } 
//     },
// });


// // Relación con Customer y services
// Reserves.belongsTo(Customers, { foreignKey: 'idCustomers' });
// Customers.hasMany(Reserves, { foreignKey: 'idCustomers' });

// Reserves.belongsTo(AditionalServices, { foreignKey: 'idAditionalServices' });
// AditionalServices.hasMany(Reserves, { foreignKey: 'idAditionalServices' });


// module.exports = Reserves;