const { validationResult } = require('express-validator');
const productSheetService = require('../services/productSheetService');

const createProductSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const productSheet = await productSheetService.createProductSheet(req.body);
        res.status(201).json(productSheet);
    } catch (error) {
        console.error("Error al crear relación producto-ficha:", error);
        res.status(400).json({ message: error.message });
    }
}

const getAllProductSheets = async (req, res) => {
    try {
        const productSheets = await productSheetService.getAllProductSheets();
        res.status(200).json(productSheets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProductSheetById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const productSheet = await productSheetService.getProductSheetById(req.params.id);
        res.status(200).json(productSheet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateProductSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await productSheetService.updateProductSheet(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteProductSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await productSheetService.deleteProductSheet(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProductSheetsBySpecSheet = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const productSheets = await productSheetService.getProductSheetsBySpecSheet(req.params.idSpecSheet);
        res.status(200).json(productSheets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getProductSheetsBySupplier = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const productSheets = await productSheetService.getProductSheetsBySupplier(req.params.idSupplier);
        res.status(200).json(productSheets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createProductSheet,
    getAllProductSheets,
    getProductSheetById,
    updateProductSheet,
    deleteProductSheet,
    getProductSheetsBySpecSheet,
    getProductSheetsBySupplier
};