const { validationResult } = require('express-validator');
const providerService = require('../services/providerService');

const createProvider = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const provider = await providerService.createProvider(req.body);
        res.status(201).json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllProvider = async (req, res) => {
    try {
        const provider = await providerService.getAllProvider();
        res.status(200).json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProviderById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const provider = await providerService.getProviderById(req.params.id);
        res.status(200).json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateProvider = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await providerService.updateProvider(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteProvider = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await providerService.deleteProvider(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateProvider = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await providerService.changeStateProvider(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createProvider,
    getAllProvider,
    getProviderById,
    updateProvider,
    deleteProvider,
    changeStateProvider,
};