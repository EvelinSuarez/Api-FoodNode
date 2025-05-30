// controllers/productionOrderDetailController.js
const { validationResult } = require('express-validator');
const productionOrderDetailService = require('../services/productionOrderDetailService'); // Renombrar servicio
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

// Rara vez se usará. Los detalles se crean con la ProductionOrder.
// Podría usarse para añadir un paso manualmente a una orden existente.
const addStepToOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params; // Asumimos ruta como /production-orders/:idProductionOrder/steps
        const stepData = req.body; // Debe incluir idProcess, processOrder, etc.
        const newStep = await productionOrderDetailService.addStepToOrder(idProductionOrder, stepData);
        res.status(201).json(newStep);
    } catch (error) {
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en addStepToOrder Controller:", error);
        res.status(500).json({ message: "Error interno al añadir el paso a la orden." });
    }
};

// Obtener todos los pasos para una orden de producción específica
const getProductionOrderDetailsByOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const steps = await productionOrderDetailService.getStepsByOrderId(idProductionOrder);
        res.status(200).json(steps);
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en getProductionOrderDetailsByOrder Controller:", error);
        res.status(500).json({ message: "Error interno al obtener los pasos de la orden." });
    }
};

// Obtener un ProductionOrderDetail específico por su ID
const getProductionOrderDetailById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrderDetail } = req.params;
        const step = await productionOrderDetailService.getStepById(idProductionOrderDetail);
        if (!step) {
            return res.status(404).json({ message: `Paso de orden de producción con ID ${idProductionOrderDetail} no encontrado.` });
        }
        res.status(200).json(step);
    } catch (error) {
        console.error("Error en getProductionOrderDetailById Controller:", error);
        res.status(500).json({ message: "Error interno al obtener el paso de la orden." });
    }
};

// ACTUALIZAR un ProductionOrderDetail (este es el que se usa desde el PATCH en productionOrderRoutes)
// No necesita un controlador separado si se maneja a través de ProductionOrderController.
// Si se mantiene, debe ser llamado desde productionOrderService.updateProductionOrderStep.
// Por ahora, lo comento ya que la lógica principal está en productionOrderService.
/*
const updateProductionOrderDetail = async (req, res, next) => {
    // ... Esta lógica ya está en productionOrderController.updateProductionOrderStep
    // y productionOrderService.updateProductionOrderStep
};
*/

// ELIMINAR un ProductionOrderDetail (riesgoso, considerar deshabilitar o añadir mucha lógica)
const deleteProductionOrderDetail = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrderDetail } = req.params; // O también idProductionOrder para verificar pertenencia
        // const { idProductionOrder } = req.params; // Si la ruta es /orders/:idOrder/steps/:stepId
        await productionOrderDetailService.deleteStep(idProductionOrderDetail /*, idProductionOrder */);
        res.status(204).end();
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        console.error("Error en deleteProductionOrderDetail Controller:", error);
        res.status(500).json({ message: "Error interno al eliminar el paso de la orden." });
    }
};


// --- Métodos de consulta que pueden ser útiles para reportes ---
const getStepsByEmployee = async (req, res, next) => {
    // ... (similar a tu getProcessDetailsByEmployee)
    try {
        const { idEmployee } = req.params;
        const steps = await productionOrderDetailService.getStepsByEmployeeId(idEmployee);
        res.status(200).json(steps);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener pasos por empleado."});
    }
};

const getActiveStepsOverall = async (req, res, next) => {
    // ... (similar a tu getActiveProcessDetails)
    try {
        const activeSteps = await productionOrderDetailService.getAllActiveSteps();
        res.status(200).json(activeSteps);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener todos los pasos activos."});
    }
};


module.exports = {
    addStepToOrder, // Para añadir un paso a una orden existente
    getProductionOrderDetailsByOrder,
    getProductionOrderDetailById,
    // updateProductionOrderDetail, // Comentado, se maneja en ProductionOrderController
    deleteProductionOrderDetail,
    getStepsByEmployee, // Para reportes
    getActiveStepsOverall, // Para reportes
    // Los "get by process" o "get by specsheet" para ProductionOrderDetail pueden no ser tan directos
    // ya que los ProductionOrderDetail están ligados a una ProductionOrder, no directamente a una SpecSheet maestra.
    // Se podría buscar ProductionOrders que usen una SpecSheet y luego sus detalles.
};