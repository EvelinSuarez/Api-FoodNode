const { validationResult } = require('express-validator');
const purchaseDetailService = require('../services/purchaseDetailService'); 

const createPurchaseDetail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const purchaseDetail = await purchaseDetailService.createPurchaseDetail(req.body);
        res.status(201).json(purchaseDetail);
    } catch (error) {
        console.error("Error al crear el detalle:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getAllPurchaseDetails = async (req, res) => {
    try {
        const purchaseDetails = await purchaseDetailService.getAllPurchaseDetails();
        res.status(200).json(purchaseDetails);
    } catch (error) {
        console.error("Error al obtener los detalles:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getPurchaseDetailById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const purchaseDetail = await purchaseDetailService.getPurchaseDetailById(id);
        if (!purchaseDetail) {
            return res.status(404).json({ message: " detalle no encontrado" });
        }
        res.status(200).json(purchaseDetail);
    } catch (error) {
        console.error("Error al obtener el detalle por ID:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const updatePurchaseDetail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const updated = await purchaseDetailService.updatePurchaseDetail(id, req.body);
        if (!updated) {
            return res.status(404).json({ message: " detalle no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al actualizar el detalle:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const deletePurchaseDetail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const deleted = await purchaseDetailService.deleteMurchaseDetail(id);
        if (!deleted) {
            return res.status(404).json({ message: "detalle no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al eliminar el detalle:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const changeStatePurchaseDetail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const updated = await purchaseDetailService.changeStatePurchaseDetail(id, req.body.state);
        if (!updated) {
            return res.status(404).json({ message: "detalle no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al cambiar estado del detalle:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    createPurchaseDetail,
    getAllPurchaseDetails,
    getPurchaseDetailById,
    updatePurchaseDetail,
    deletePurchaseDetail,
    changeStatePurchaseDetail,
};
