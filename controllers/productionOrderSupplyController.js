// controllers/productionOrderSupplyController.js
const { validationResult } = require('express-validator');
const productionOrderSupplyService = require('../services/productionOrderSupplyService');
const { NotFoundError, BadRequestError } = require('../utils/customErrors'); // Asumiendo errores custom

// Registrar uno o más insumos consumidos para una orden de producción
const addConsumedSuppliesToOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        // req.body podría ser un solo objeto o un array de objetos
        // [{ idSupply, quantityConsumed, measurementUnitConsumedSnapshot (opc), consumptionDate (opc), notes (opc) }, ...]
        const consumedSuppliesData = Array.isArray(req.body) ? req.body : [req.body];

        const addedSupplies = await productionOrderSupplyService.addOrUpdateConsumedSupplies(idProductionOrder, consumedSuppliesData);
        res.status(201).json(addedSupplies);
    } catch (error) {
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en addConsumedSuppliesToOrder Controller:", error);
        res.status(500).json({ message: "Error interno al registrar insumos consumidos." });
    }
};

// Obtener todos los insumos consumidos para una orden de producción específica
const getConsumedSuppliesByOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder } = req.params;
        const consumedSupplies = await productionOrderSupplyService.getConsumedSuppliesByOrderId(idProductionOrder);
        res.status(200).json(consumedSupplies);
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en getConsumedSuppliesByOrder Controller:", error);
        res.status(500).json({ message: "Error interno al obtener insumos consumidos." });
    }
};

// Obtener un registro de consumo específico por su ID
const getConsumedSupplyById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrderSupply } = req.params;
        const consumedSupply = await productionOrderSupplyService.getConsumedSupplyRecordById(idProductionOrderSupply);
        if (!consumedSupply) {
            return res.status(404).json({ message: `Registro de consumo ID ${idProductionOrderSupply} no encontrado.` });
        }
        res.status(200).json(consumedSupply);
    } catch (error) {
        console.error("Error en getConsumedSupplyById Controller:", error);
        res.status(500).json({ message: "Error interno al obtener el registro de consumo." });
    }
};

// Actualizar un registro de consumo específico
const updateConsumedSupplyRecord = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder, idProductionOrderSupply } = req.params; // idProductionOrder para verificar pertenencia
        const dataToUpdate = req.body; // Ej: { quantityConsumed, notes }
        const updatedRecord = await productionOrderSupplyService.updateConsumedSupplyRecord(idProductionOrder, idProductionOrderSupply, dataToUpdate);
        res.status(200).json(updatedRecord);
    } catch (error) {
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en updateConsumedSupplyRecord Controller:", error);
        res.status(500).json({ message: "Error interno al actualizar el registro de consumo." });
    }
};

// Eliminar un registro de consumo específico
const deleteConsumedSupplyRecord = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idProductionOrder, idProductionOrderSupply } = req.params; // idProductionOrder para verificar pertenencia
        await productionOrderSupplyService.deleteConsumedSupplyRecord(idProductionOrder, idProductionOrderSupply);
        res.status(204).end();
    } catch (error) {
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Error en deleteConsumedSupplyRecord Controller:", error);
        res.status(500).json({ message: "Error interno al eliminar el registro de consumo." });
    }
};

module.exports = {
    addConsumedSuppliesToOrder,
    getConsumedSuppliesByOrder,
    getConsumedSupplyById,
    updateConsumedSupplyRecord,
    deleteConsumedSupplyRecord,
};