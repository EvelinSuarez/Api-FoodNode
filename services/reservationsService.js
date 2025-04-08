const reservationsRepository = require('../repositories/reservationsRepository');
const passRepository = require('../repositories/passRepository');

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

const changeStateReservations = async (id, state) => {
    return reservationsRepository.changeStateReservations(id, state);
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeStateReservations,
};