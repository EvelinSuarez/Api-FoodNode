const { validationResult } = require('express-validator');
const specSheetService = require('../services/spechsheetService');
const productService = require('../services/productService');

const createSpecSheet = async (req, res) => {
    try {
        console.log('Iniciando creación de ficha técnica...');
        const availableProducts = await productService.getAllProducts();
        
        if (!availableProducts || availableProducts.length === 0) {
            return res.status(404).json({ message: "No hay productos disponibles" });
        }
        
        console.log(`Se encontraron ${availableProducts.length} productos disponibles`);
        
        // Aquí continuaría el código para crear la ficha técnica
        const newSpecSheet = await specSheetService.createSpecSheet(req.body);
        
        res.status(201).json(newSpecSheet);
    } catch (error) {
        console.error('Error completo en createSpecSheet:', error);
        res.status(500).json({ 
            message: "Error al crear la ficha técnica",
            error: error.message 
        });
    }
};

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