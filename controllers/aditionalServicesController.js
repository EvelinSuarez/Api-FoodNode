const { validationResult } = require('express-validator');
const aditionalServicesService = require('../services/aditionalServicesService');

const createAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const aditionalServices = await aditionalServicesService.createAditionalServices(req.body);
        res.status(201).json(aditionalServices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllAditionalServices = async (req, res) => {
    
    try {
        const aditionalServices = await aditionalServicesService.getAllAditionalServices();
        res.status(200).json(aditionalServices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

}

const getAditionalServicesById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const aditionalServices = await aditionalServicesService.getAditionalServicesById(req.params.id);
        res.status(200).json(aditionalServices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await aditionalServicesService.updateAditionalServices(req.params.id, req.body);
        res.status(204).end();
        res.status(200).json({ message: 'Servicio adicional actualizado correctamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await aditionalServicesService.deleteAditionalServices(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await aditionalServicesService.changeStateAditionalServices(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById,
    updateAditionalServices,
    deleteAditionalServices,
    changeStateAditionalServices,
};