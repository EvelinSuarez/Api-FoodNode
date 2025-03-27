const { validationResult } = require('express-validator');
const reservationServicesService = require('../services/reservationServicesService');

// Agregar un servicio adicional a una reserva
const addServiceToReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reservationServices = await reservationServicesService.addServiceToReservation(req.body);
        res.status(201).json(reservationServices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Obtener todos los servicios adicionales de una reserva

const getAllServices = async (req, res) => {
    try {
        const aditionalServices = await reservationServicesService.getAllServices();
        res.status(200).json(aditionalServices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Obtener un servicio adicional de una reserva
const getServicesByReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const aditionalservices = await reservationServicesService.getServicesByReservation(req.params.idReservations);
        res.status(200).json(aditionalservices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un servicio adicional de una reserva
const removeServiceFromReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await reservationServicesService.removeServiceFromReservation(req.params.idReservations, req.params.idAditionalServices);
        res.status(200).json({ 
            success: true,
            message: "Servicio eliminado de la reserva exitosamente" 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

module.exports = {
    addServiceToReservation,
    getServicesByReservation,
    removeServiceFromReservation,
    getAllServices
};
