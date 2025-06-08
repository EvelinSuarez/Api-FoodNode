// controllers/supplyController.js
const { validationResult } = require('express-validator');
const supplyService = require('../services/supplyService'); // Renombrado
const { NotFoundError, BadRequestError } = require('../utils/customErrors'); // Asumiendo errores custom

const createSupply = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // req.body: supplyName, description, unitOfMeasure, status (opcional)
        const newSupply = await supplyService.createSupply(req.body);
        res.status(201).json(newSupply);
    } catch (error) {
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        console.error("Controller[Supply]: Error al crear insumo:", error);
        res.status(500).json({ message: "Error interno al crear el insumo." });
    }
};

const getAllSupplies = async (req, res, next) => {
    try {
        // Podrías añadir filtros aquí: req.query (ej. ?status=true, ?category=x)
        const supplies = await supplyService.getAllSupplies(req.query);
        res.status(200).json(supplies);
    } catch (error) {
        console.error("Controller[Supply]: Error en getAllSupplies:", error);
        res.status(500).json({ message: "Error interno al obtener los insumos." });
    }
};

const getSupplyById = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idSupply } = req.params; // Renombrado de 'id' a 'idSupply'
        const supply = await supplyService.getSupplyById(idSupply);
        res.status(200).json(supply);
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        console.error("Controller[Supply]: Error en getSupplyById:", error);
        res.status(500).json({ message: "Error interno al obtener el insumo." });
    }
};

const updateSupply = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idSupply } = req.params;
        // req.body: campos a actualizar (supplyName, description, unitOfMeasure, status, etc.)
        const updatedSupply = await supplyService.updateSupply(idSupply, req.body);
        res.status(200).json(updatedSupply); // Devolver el objeto actualizado
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        console.error("Controller[Supply]: Error en updateSupply:", error);
        res.status(500).json({ message: "Error interno al actualizar el insumo." });
    }
};

const deleteSupply = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idSupply } = req.params;
        await supplyService.deleteSupply(idSupply);
        res.status(204).end();
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message }); // Ej: si está en uso
        console.error("Controller[Supply]: Error en deleteSupply:", error);
        res.status(500).json({ message: "Error interno al eliminar el insumo." });
    }
};

const changeSupplyStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idSupply } = req.params;
        const { status } = req.body; // El nuevo estado viene en el body
        const updatedSupply = await supplyService.changeSupplyStatus(idSupply, status);
        res.status(200).json(updatedSupply); // Devolver el objeto actualizado
    } catch (error) {
        if (error instanceof NotFoundError) return res.status(404).json({ message: error.message });
        if (error instanceof BadRequestError) return res.status(400).json({ message: error.message });
        console.error("Controller[Supply]: Error en changeSupplyStatus:", error);
        res.status(500).json({ message: "Error interno al cambiar el estado del insumo." });
    }
};

module.exports = {
    createSupply,
    getAllSupplies,
    getSupplyById,
    updateSupply,
    deleteSupply,
    changeSupplyStatus,
};