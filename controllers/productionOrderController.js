// RUTA: /controllers/productionOrderController.js
// VERSIÓN TOTALMENTE COMPLETA Y FINAL (Lógica por Peso)

const { validationResult } = require('express-validator');
const productionOrderService = require('../services/productionOrderService');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const { Op } = require("sequelize");

// Helper para manejar errores y responder
const handleControllerError = (res, error) => {
    if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
    }
    if (error instanceof BadRequestError) {
        return res.status(400).json({ message: error.message, errors: error.errors });
    }
    console.error("Controller Error:", error.name, error.message, error.stack);
    return res.status(500).json({ message: error.message || "Error interno del servidor." });
};

const checkStockAvailability = async (req, res) => {
    try {
        const { idSpecSheet, targetProductionWeight, targetProductionWeightUnit } = req.body;
        if (!idSpecSheet || !targetProductionWeight || !targetProductionWeightUnit) {
             throw new BadRequestError("Se requieren los campos 'idSpecSheet', 'targetProductionWeight' y 'targetProductionWeightUnit'.");
        }

        const result = await productionOrderService.checkStockForWeight({ 
            idSpecSheet, 
            targetProductionWeight,
            targetProductionWeightUnit
        });
        res.status(200).json(result);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const startProductionAndDeductSupplies = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const { idEmployeeAssigned } = req.body;
        console.log(`[CONTROLLER] startProductionAndDeductSupplies - OrderID: ${idProductionOrder}, EmployeeID: ${idEmployeeAssigned}`);
        const startedOrder = await productionOrderService.startProductionAndDeductSupplies(idProductionOrder, idEmployeeAssigned);
        res.status(200).json(startedOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const checkActiveOrderForProduct = async (req, res) => {
    try {
        const { idProduct } = req.params;
        const activeOrders = await productionOrderService.getActiveOrdersByProductId(idProduct);
        if (activeOrders && activeOrders.length > 0) {
            return res.status(200).json({ hasActiveOrder: true, activeOrder: activeOrders[0] });
        }
        return res.status(200).json({ hasActiveOrder: false });
    } catch (error) {
        handleControllerError(res, error);
    }
};

const createProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const orderData = req.body;
        console.log('[CONTROLLER] createProductionOrder - orderData recibida:', orderData);
        const productionOrder = await productionOrderService.createProductionOrder(orderData);
        res.status(201).json(productionOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getAllProductionOrders = async (req, res) => {
    try {
        const { limit, offset, orderClause, whereClause } = req.query; // Asumiendo que procesas esto aquí o en el servicio

        // --- INICIO DE LA CORRECCIÓN ---
        const filters = {};
        if (req.query.status) {
            filters.status = req.query.status;
        }
        // ¡Esta es la parte clave!
        if (req.query.status_not_in) {
            // Convierte el string "COMPLETED,CANCELLED" en un array ['COMPLETED', 'CANCELLED']
            const excludedStatuses = req.query.status_not_in.split(',');
            filters.status = { [Op.notIn]: excludedStatuses }; // Usa el operador de Sequelize Op.notIn
        }
        if (req.query.idProduct) {
            filters.idProduct = req.query.idProduct;
        }
        // --- FIN DE LA CORRECCIÓN ---

        // Pasamos los filtros procesados al servicio
        const productionOrders = await productionOrderService.getAllProductionOrders({ ...req.query, whereClause: filters });
        res.status(200).json(productionOrders);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getProductionOrderById = async (req, res) => {
    try {
        const { idProductionOrder } = req.params;
        const productionOrder = await productionOrderService.getProductionOrderById(idProductionOrder);
        res.status(200).json(productionOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const updateProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const dataToUpdate = req.body;
        console.log(`[CONTROLLER] updateProductionOrder - ID: ${idProductionOrder}, dataToUpdate:`, dataToUpdate);
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
        console.log(`[CONTROLLER] updateProductionOrderStep - OrderID: ${idProductionOrder}, DetailID: ${idProductionOrderDetail}, stepData:`, stepData);
        const result = await productionOrderService.updateProductionOrderStep(idProductionOrder, idProductionOrderDetail, stepData);
        res.status(200).json(result);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const finalizeProductionOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { idProductionOrder } = req.params;
        console.log(`[CONTROLLER] finalizeProductionOrder - ID: ${idProductionOrder}, body:`, req.body);
        const finalizedOrder = await productionOrderService.finalizeProductionOrder(idProductionOrder, req.body);
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
        const { status, observations } = req.body;
        console.log(`[CONTROLLER] changeProductionOrderStatus - ID: ${idProductionOrder}, newStatus: ${status}`);
        const updatedOrder = await productionOrderService.changeProductionOrderStatus(idProductionOrder, status, observations);
        res.status(200).json(updatedOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const deleteProductionOrder = async (req, res) => {
    try {
        const { idProductionOrder } = req.params;
        console.log(`[CONTROLLER] deleteProductionOrder - ID: ${idProductionOrder}`);
        const result = await productionOrderService.deleteProductionOrder(idProductionOrder);
        res.status(200).json(result);
    } catch (error) {
        handleControllerError(res, error);
    }
};

module.exports = {
    createProductionOrder,
    getAllProductionOrders,
    getProductionOrderById,
    updateProductionOrder,
    updateProductionOrderStep,
    finalizeProductionOrder,
    changeProductionOrderStatus,
    deleteProductionOrder,
    checkActiveOrderForProduct,
    startProductionAndDeductSupplies,
    checkStockAvailability,
};