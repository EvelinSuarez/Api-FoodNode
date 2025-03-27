const reservationServicesRepository = require('../repositories/reservationServicesRepository');

const addServiceToReservation = async (reservationServices) => {
    return reservationServicesRepository.addServiceToReservation(reservationServices);
};

const getServicesByReservation = async (idReservations) => {
    return reservationServicesRepository.getServicesByReservation(idReservations);
};

const removeServiceFromReservation = async (idReservations, idAditionalServices) => {
    return reservationServicesRepository.removeServiceFromReservation(idReservations, idAditionalServices);
};
const getAllServices = async () => {
    return reservationServicesRepository.getAllServices();
};


module.exports = {
    addServiceToReservation,
    getServicesByReservation,
    removeServiceFromReservation,
    getAllServices
};
