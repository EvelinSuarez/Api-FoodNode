const Reservations = require('../models/reservations');

const createReservations = async (reservations) => {
    return Reservations.create(reservations);
}

const getAllReservations = async () => {
    return Reservations.findAll();
}

const getReservationsById = async (id) => {
    return Reservations.findByPk(id);
}

const updateReservations = async (id, reservations) => {
    return Reservations.update(reservations, { where: { id } });
}

const deleteReservations = async (id) => {
    return Reservations.destroy({ where: { id } });
}

const changeSateReservations = async (id, state) => {
    return Reservations.update({ state }, { where: { id } });
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeSateReservations,
};