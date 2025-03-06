const { validationResult } = require('express-validator');
const specSheetService = require('../services/spechSheetService');

const createSpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const specSheet = await specSheetService.createSpecSheet(req.body);
        res.status(201).json(specSheet);
    } catch (error) {
        console.error("Error al crear ficha técnica:", error);
        res.status(400).json({ message: error.message });
    }
}

const getAllSpecSheets = async (req, res) => {
    try {
        const specSheets = await specSheetService.getAllSpecSheets();
        console.log("Fichas técnicas obtenidas:", specSheets);
        res.status(200).json(specSheets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getSpecSheetById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const specSheet = await specSheetService.getSpecSheetById(req.params.id);
        res.status(200).json(specSheet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateSpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await specSheetService.updateSpecSheet(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteSpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await specSheetService.deleteSpecSheet(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateSpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await specSheetService.changeStateSpecSheet(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getSpecSheetsByProduct = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const specSheets = await specSheetService.getSpecSheetsByProduct(req.params.idProduct);
        res.status(200).json(specSheets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createSpecSheet,
    getAllSpecSheets,
    getSpecSheetById,
    updateSpecSheet,
    deleteSpecSheet,
    changeStateSpecSheet,
    getSpecSheetsByProduct
};