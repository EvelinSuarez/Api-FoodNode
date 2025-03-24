const { validationResult } = require('express-validator');
const conceptSpentService = require('../services/conceptSpentService');

const createConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const conceptSpent = await conceptSpentService.createConceptSpent(req.body);
        res.status(201).json(conceptSpent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllConceptSpents = async (req, res) => {
    try {
        const conceptSpents = await conceptSpentService.getAllConceptSpents();
        res.status(200).json(conceptSpents);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getConceptSpentById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10);
    if (isNaN(idExpenseType)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const conceptSpent = await conceptSpentService.getConceptSpentById(idExpenseType);
        if (!conceptSpent) {
            return res.status(404).json({ message: 'Concepto de gasto no encontrado' });
        }
        res.status(200).json(conceptSpent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10);
    console.log(`Buscando concepto de gasto con ID: ${idExpenseType}`);

    try {
        const conceptSpent = await conceptSpentService.updateConceptSpent(idExpenseType, req.body);
        if (!conceptSpent) {
            return res.status(404).json({ message: 'Concepto de gasto no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10);
    if (isNaN(idExpenseType)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const result = await conceptSpentService.deleteConceptSpent(idExpenseType);
        if (!result) {
            return res.status(404).json({ message: 'Concepto de gasto no encontrado' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changeStateConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idExpenseType = parseInt(req.params.idExpenseType, 10);
    if (isNaN(idExpenseType)) {
        return res.status(400).json({message: "El Id debe ser un número valido"})
    }
    try {
        await conceptSpentService.changeStateConceptSpent(idExpenseType, req.body.status);
        const updateConceptSpent = await conceptSpentService.getConceptSpentById(idExpenseType);
        res.status(200).json(updateConceptSpent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};