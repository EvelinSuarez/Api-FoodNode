const { validationResult } = require('express-validator');
const supplierService = require('../services/supplierService');

const createSupplier = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const supplier = await supplierService.createSupplier(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getSupplierById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateSupplier = async (req, res) => {
    console.log("req.params:", req.params);
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await supplierService.updateSupplier(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteSupplier = async (req, res) => {
    console.log("req.params:", req.params);
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await supplierService.deleteSupplier(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateSupplier = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await supplierService.changeStateSupplier(req.params.id, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    changeStateSupplier,
};