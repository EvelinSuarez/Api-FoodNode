const { validationResult } = require('express-validator');
const reservationsService = require('../services/reservationsService');

const createReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const reservations = await reservationsService.createReservations(req.body);
        res.status(201).json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllReservations = async (req, res) => {
    try {
        const reservations = await reservationsService.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getReservationsById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const reservations = await reservationsService.getReservationsById(req.params.id);
        res.status(200).json(reservations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await reservationsService.updateReservations(req.params.id, req.body);
        res.status(204).end();
        res.status(200).json({ message: 'Reserva actualizada correctamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await reservationsService.deleteReservations(req.params.id);
        res.status(200).json({ 
            success: true,
            message: "Reserva eliminada exitosamente" 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

const changeStateReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await reservationsService.changeStateReservations(req.params.id, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeStateReservations,
};