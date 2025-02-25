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
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = parseInt(req.params.id,10);  // Convierte el ID a un número entero
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const provider = await providerService.getProviderById(id);
        if (!provider) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.status(200).json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


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
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = parseInt(req.params.id);  // Convierte el ID a un número entero
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const result = await providerService.deleteProvider(id);
        if (!result) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

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