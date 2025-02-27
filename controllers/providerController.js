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
    const idProvider = parseInt(req.params.idProvider,10);  // Convierte el ID a un número entero
    if (isNaN(idProvider)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const provider = await providerService.getProviderById(idProvider);
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
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idProvider = parseInt(req.params.idProvider, 10);
    console.log(`Buscando proveedor con ID: ${idProvider}`);  // Verificando si el ID es correcto

    try {
        const provider = await providerService.updateProvider(idProvider, req.body);
        if (!provider) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProvider = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idProvider = parseInt(req.params.idProvider);  // Convierte el ID a un número entero
    if (isNaN(idProvider)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const result = await providerService.deleteProvider(idProvider);
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
        await providerService.changeStateProvider(req.params.idProvider, req.body.state);
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