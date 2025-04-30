const reservationsRepository = require('../repositories/reservationsRepository');


const createReservations = async (reservations) => {
    return reservationsRepository.createReservations(reservations);
}

const getAllReservations = async () => {
    return reservationsRepository.getAllReservations();
}

const getReservationsById = async (id) => {
    return reservationsRepository.getReservationsById(id);
}

const updateReservations = async (id, reservations) => {
    return reservationsRepository.updateReservations(id, reservations);
}

const deleteReservations = async (id) => {
    return reservationsRepository.deleteReservations(id);
}

const changeStateReservations = async (id, status) => {
    return reservationsRepository.changeStateReservations(id, status);
}

const  reprogramReservationsValidation = async (id, dateTime) => {
    return reservationsRepository.reprogramReservationsValidation(id, dateTime);
}

const changeStateValidation = async (id, status) => {
    return reservationsRepository.changeStateValidation(id, status);
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeStateReservations,
    reprogramReservationsValidation,
    changeStateValidation
};