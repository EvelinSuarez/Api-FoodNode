const { validationResult } = require('express-validator');
const productionOrderService = require('../services/productionOrderService');

const createProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const productionOrder = await productionOrderService.createProductionOrder(req.body);
        res.status(201).json(productionOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllProductionOrders = async (req, res) => {
    try {
        const productionOrders = await productionOrderService.getAllProductionOrders();
        res.status(200).json(productionOrders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProductionOrderById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const productionOrder = await productionOrderService.getOrderById(req.params.id);
        res.status(200).json(productionOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await productionOrderService.updateProductionOrder(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await productionOrderService.deleteProductionOrder(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const changeStateProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await productionOrderService.changeStateProductionOrder(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    updateProductionOrder,
    deleteProductionOrder,
    changeStateProductionOrder,
};
