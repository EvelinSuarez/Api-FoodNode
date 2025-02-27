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

const changeSateReservations = async (id, state) => {
    return reservationsRepository.changeSateReservations(id, state);
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeSateReservations,
};