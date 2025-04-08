const Reservations = require('../models/reservations');
const Customers = require('../models/customers');
const AditionalServices = require('../models/aditionalServices');
const Pass = require('../models/pass');

const createReservations = async (reservations) => {
    return Reservations.create(reservations);
}

const getAllReservations = async () => {
    const reservations = await Reservations.findAll({
        include: [
            {
                model: Customers,
            },
            {
                model: AditionalServices,
            },
            { model: Pass, as: 'Pass', attributes: ['idPass', 'paymentDate', 'amount'] },
        ]
    });
    
    return reservations;
    
}

const getReservationsById = async (id) => {
    return Reservations.findByPk(id, {
        include: [
            {
                model: Customers,
            },
            {
                model: AditionalServices,
            },
            { model: Pass, as: 'Pass', attributes: ['idPass', 'paymentDate', 'amount'] }
        ]
    });
};


const updateReservations = async (idReservations, reservations) => {
    return Reservations.update(reservations, { where: { idReservations } });
}

const deleteReservations = async (idReservations) => {
    return Reservations.destroy({ where: { idReservations } });
}

const changeStateReservations = async (idReservations, status) => {
    return Reservations.update({ status:status }, { where: { idReservations } });
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeStateReservations,
};