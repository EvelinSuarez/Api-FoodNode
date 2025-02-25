const { validationResult } = require('express-validator');
const conceptSpentService = require('../services/conceptSpentService');  // Cambiar a servicio de conceptSpent

const createConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const conceptSpent = await conceptSpentService.createConceptSpent(req.body);
        res.status(201).json(conceptSpent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllConceptSpents = async (req, res) => {
    try {
        const conceptSpents = await conceptSpentService.getAllConceptSpents();  // Cambiar nombre de la función
        res.status(200).json(conceptSpents);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getConceptSpentById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const conceptSpent = await conceptSpentService.getConceptSpentById(req.params.id);  // Cambiar nombre de la función
        res.status(200).json(conceptSpent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        await conceptSpentService.updateConceptSpent(req.params.id, req.body);  // Cambiar nombre de la función
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        await conceptSpentService.deleteConceptSpent(req.params.id);  // Cambiar nombre de la función
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        await conceptSpentService.changeStateConceptSpent(req.params.id, req.body.state);  // Cambiar nombre de la función
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};
