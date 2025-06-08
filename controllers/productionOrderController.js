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
        return res.status(400).json({ message: error.message, errors: error.errors }); // Incluir errores de validación si existen
    }
    console.error("Controller Error:", error.name, error.message, error.stack); // Loguear más detalle
    return res.status(500).json({ message: error.message || "Error interno del servidor." });
};

const checkActiveOrderForProduct = async (req, res) => {
    try {
        const { idProduct } = req.params;
        // Reutilizamos la función de servicio que ya existe
        const activeOrders = await productionOrderService.getActiveOrdersByProductId(idProduct);
        
        if (activeOrders && activeOrders.length > 0) {
            // Si se encuentran órdenes activas, devuelve la primera como evidencia
            return res.status(200).json({
                hasActiveOrder: true,
                activeOrder: activeOrders[0] 
            });
        }
        
        // Si no se encuentran, responde que no hay
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
        // Construir orderData con todos los campos que el frontend podría enviar para la creación
        const orderData = {
            idProduct: req.body.idProduct,
            initialAmount: req.body.initialAmount,
            idEmployeeRegistered: req.body.idEmployeeRegistered || req.user?.idEmployee, // Asumir req.user si no se envía
            idSpecSheet: req.body.idSpecSheet,
            idProvider: req.body.idProvider,
            observations: req.body.observations,
            status: req.body.status || 'PENDING',
            productNameSnapshot: req.body.productNameSnapshot, // El frontend lo envía
            inputInitialWeight: req.body.inputInitialWeight,   // Campo del frontend
            inputInitialWeightUnit: req.body.inputInitialWeightUnit, // Campo del frontend
        };
        
        console.log('[CONTROLLER] createProductionOrder - orderData recibida del body y enviada al servicio:', orderData);

        const productionOrder = await productionOrderService.createProductionOrder(orderData);
        res.status(201).json(productionOrder);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getAllProductionOrders = async (req, res) => {
    try {
        // Los filtros y paginación se procesan en el servicio
        const productionOrders = await productionOrderService.getAllProductionOrders(req.query);
        res.status(200).json(productionOrders);
    } catch (error) {
        handleControllerError(res, error);
    }
};

const getProductionOrderById = async (req, res) => {
    const errors = validationResult(req); // Para validar params si es necesario
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
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
        res.status(200).json(result); // El servicio ahora devuelve la orden completa
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
        // No es necesario destructurar aquí, el servicio lo hará.
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
        console.log(`[CONTROLLER] changeProductionOrderStatus - ID: ${idProductionOrder}, newStatus: ${status}, obs: ${observations}`);
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
        console.log(`[CONTROLLER] deleteProductionOrder - ID: ${idProductionOrder}`);
        const result = await productionOrderService.deleteProductionOrder(idProductionOrder);
        res.status(200).json(result); // Devolver el mensaje de éxito del servicio
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
};