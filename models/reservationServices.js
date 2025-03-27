const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); 
const AditionalServices = require("./aditionalServices"); 
const Reservations = require("./reservations");

const ReservationServices = sequelize.define("reservationServices", {
    idReservations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Reservations,
            key: "idReservations"
        },
        onDelete: "CASCADE"
    },
    idAditionalServices: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AditionalServices,
            key: "idAditionalServices"
        },
        onDelete: "CASCADE"
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true, 
    tableName: "reservationServices" 
});

// Definir relaciones
Reservations.belongsToMany(AditionalServices, { through: ReservationServices, foreignKey: 'idReservations' });
AditionalServices.belongsToMany(Reservations, { through: ReservationServices,foreignKey: 'idAditionalServices' });


module.exports = ReservationServices;
