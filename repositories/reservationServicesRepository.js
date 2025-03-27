const ReservationServices = require('../models/reservationServices');

const addServiceToReservation = async ({ idReservations, idAditionalServices, cantidad }) => {
    return await ReservationServices.create({ idReservations, idAditionalServices, cantidad });
};

const getServicesByReservation = async (idReservations) => {
    return await ReservationServices.findAll({ where: { idReservations } });
};

const removeServiceFromReservation = async (idReservations, idAditionalServices) => {
    return await ReservationServices.destroy({ where: { idReservations, idAditionalServices } });
};
const getAllServices = async () => {
    return await ReservationServices.findAll();
};


module.exports = {
    addServiceToReservation,
    getServicesByReservation,
    removeServiceFromReservation,
    getAllServices
};
