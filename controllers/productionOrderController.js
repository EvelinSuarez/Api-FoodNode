// controllers/productionOrderController.js
const { validationResult } = require('express-validator');
const productionOrderService = require('../services/productionOrderService');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

// Helper para manejar errores y responder
const handleControllerError = (res, error) => {
    if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
    }
    if (error instanceof BadRequestError) {
        return res.status(400).json({ message: error.message });
    }
    console.error("Controller Error:", error); // Loguear el error completo para depuración
    return res.status(500).json({ message: error.message || "Error interno del servidor." });
};

const createProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // idEmployeeRegistered debería venir del usuario autenticado (req.user.idEmployee)
        // o pasarse explícitamente si un admin crea por otro.
        // Por ahora, asumimos que se pasa en el body o lo maneja el servicio.
        const orderData = {
            idProduct: req.body.idProduct, // Puede ser null/undefined inicialmente para un 'DRAFT'
            initialAmount: req.body.initialAmount, // Puede ser 0 o 1 para un 'DRAFT'
            idEmployeeRegistered: req.body.idEmployeeRegistered || req.user?.idEmployee, // Tomar de req.user si está disponible
            idSpecSheet: req.body.idSpecSheet,       // Opcional al inicio
            idProvider: req.body.idProvider,         // Opcional
            observations: req.body.observations,     // Opcional
            status: req.body.status || 'PENDING',    // Frontend puede sugerir 'PENDING' o 'SETUP'
            // Los campos de peso inicial/final se llenarán después
        };
        const productionOrder = await productionOrderService.createProductionOrder(orderData);
        res.status(201).json(productionOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getAllProductionOrders = async (req, res) => {
    try {
        const { status, idProduct, idEmployeeRegistered, page, limit, sortBy, sortOrder } = req.query;
        const filters = { status, idProduct, idEmployeeRegistered };
        const pagination = { page, limit };
        const sort = { sortBy, sortOrder };
        
        const productionOrders = await productionOrderService.getAllProductionOrders(filters, pagination, sort);
        res.status(200).json(productionOrders); // El servicio debería devolver { data, totalPages, currentPage }
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getProductionOrderById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const productionOrder = await productionOrderService.getProductionOrderById(idProductionOrder);
        // NotFoundError es manejado por el servicio
        res.status(200).json(productionOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// Actualiza campos de la orden, incluyendo los de configuración inicial y pesos.
const updateProductionOrder = async (req, res) => { // Renombrado para ser más genérico
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const dataToUpdate = req.body; // Puede incluir idProduct, initialAmount, productNameSnapshot, inputInitialWeight, etc.
        const updatedOrder = await productionOrderService.updateProductionOrder(idProductionOrder, dataToUpdate);
        res.status(200).json(updatedOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const updateProductionOrderStep = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder, idProductionOrderDetail } = req.params;
        const stepData = req.body;
        const updatedStep = await productionOrderService.updateProductionOrderStep(idProductionOrder, idProductionOrderDetail, stepData);
        res.status(200).json(updatedStep);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const finalizeProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const {
            finalQuantityProduct,
            finishedProductWeight,
            finishedProductWeightUnit,
            inputFinalWeightUnused,
            inputFinalWeightUnusedUnit,
            consumedSupplies // Array de { idSupply, quantityConsumed, notes }
        } = req.body;

        const finalizedOrder = await productionOrderService.finalizeProductionOrder(idProductionOrder, {
            finalQuantityProduct,
            finishedProductWeight,
            finishedProductWeightUnit,
            inputFinalWeightUnused,
            inputFinalWeightUnusedUnit,
            consumedSupplies
        });
        res.status(200).json(finalizedOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const changeProductionOrderStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const { status, observations } = req.body; // Puede incluir observaciones para el cambio de estado
        const updatedOrder = await productionOrderService.changeProductionOrderStatus(idProductionOrder, status, observations);
        res.status(200).json(updatedOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const deleteProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        await productionOrderService.deleteProductionOrder(idProductionOrder);
        res.status(204).end();
    } catch (error) {
        handleControllerError(res, error);
    }
};

module.exports = {
    createProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    updateProductionOrder, // Renombrado
    updateProductionOrderStep,
    finalizeProductionOrder,
    changeProductionOrderStatus,
    deleteProductionOrder,
};