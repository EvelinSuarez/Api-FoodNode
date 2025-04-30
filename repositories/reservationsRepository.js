const Reservations = require('../models/reservations');
const Customers = require('../models/customers');
const AditionalServices = require('../models/aditionalServices');

const createReservations = async (reservations) => {
    const {idCustomers, idAditionalServices } = reservations;

    // Crear la reserva
    const newReservation = await Reservations.create(reservations);
    const customer = await Customers.findByPk(idCustomers);
    if (!customer) {
        throw new Error('El cliente seleccionado no existe.');
    }
    // Asociar servicios adicionales
    if (idAditionalServices && Array.isArray(idAditionalServices)) {
        const services = await AditionalServices.findAll({
            where: { idAditionalServices },
        });
        await newReservation.addAditionalServices(services); // Inserta en la tabla intermedia
        // return await Reservations.create(reservations);
    }

    return newReservation;
};

const getAllReservations = async () => {
    return await Reservations.findAll({
        include: [
            {
                model: Customers, // Incluye la relación con Customers
            },
            {
                model: AditionalServices, // Incluye la relación con AditionalServices
                through: { attributes: [] }, // Excluye columnas de la tabla intermedia
            },
        ],
    });
};

const getReservationsById = async (id) => {
    return await Reservations.findByPk(id, {
        include: [
            {
                model: Customers, // Incluye la relación con Customers
            },
            {
                model: AditionalServices, // Incluye la relación con AditionalServices
                through: { attributes: [] }, // Excluye columnas de la tabla intermedia
            },
        ],
    });
};


const updateReservations = async (idReservations, reservations) => {
    const { idAditionalServices, ...reservationFields } = reservations;

    // Encuentra la reserva
    const reservation = await Reservations.findByPk(idReservations);
    if (!reservation) {
        throw new Error('Reserva no encontrada');
    }

    // Actualiza los campos de la reserva
    await reservation.update(reservationFields);

    // Actualiza los servicios adicionales
    if (idAditionalServices && Array.isArray(idAditionalServices)) {
        const services = await AditionalServices.findAll({
            where: { idAditionalServices },
        });
        await reservation.setAditionalServices(services); // Actualiza la tabla intermedia
    }

    return reservation;
};

const deleteReservations = async (idReservations) => {
    return Reservations.destroy({ where: { idReservations } });
}

const changeStateReservations = async (idReservations, status) => {
    return Reservations.update({ status:status }, { where: { idReservations } });
}

// Validar reprogramación de reservas
const reprogramReservationsValidation = async (idReservations, dateTime) => {
    const reservations = await Reservations.findOne({ where: { idReservations } });
    if (!reservations) {
        throw new Error('La reserva no existe');
    }

    const existingReservations = await Reservations.findOne({ where: { dateTime } });
    if (existingReservations) {
        throw new Error('Ya existe una reserva para esta fecha y hora');
    }
};

// Validar cambio de estado de reservas
const changeStateValidation = async (idReservations, status) => {
    const reservations = await Reservations.findOne({ where: { idReservations } });
    if (!reservations) {
        throw new Error('La reserva no existe');
    }

    // Nota: Esta validación puede no tener sentido dependiendo de tu lógica
    // Si quieres asegurarte de que no haya duplicados de estado, deja este bloque
    const existingReservations = await Reservations.findOne({ where: { status } });
    if (existingReservations) {
        throw new Error('Ya existe una reserva con este estado');
    }
};


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