const { validationResult } = require('express-validator');
const registerPurchaseService = require('../services/registerPurchaseService');

const createRegisterPurchase = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const registerPurchase = await registerPurchaseService.createRegisterPurchase(req.body);
        res.status(201).json(registerPurchase);
    } catch (error) {
        console.error("Error al registrar la compra:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getAllRegisterPurchases = async (req, res) => {
    try {
        const registerPurchases = await registerPurchaseService.getAllRegisterPurchases();
        res.status(200).json(registerPurchases);
    } catch (error) {
        console.error("Error al obtener compras registradas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getRegisterPurchaseById = async (req, res) => {
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const registerPurchase = await registerPurchaseService.getRegisterPurchaseById(idPurchase);
        if (!registerPurchase) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        res.status(200).json(registerPurchase);
    } catch (error) {
        console.error("Error al obtener compra por ID:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const updateRegisterPurchase = async (req, res) => {
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const updated = await registerPurchaseService.updateRegisterPurchase(idPurchase, req.body);
        if (!updated) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        res.status(200).json({ message: "Compra actualizada exitosamente" }); // Código 200 y mensaje
    } catch (error) {
        console.error("Error al actualizar compra:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const deleteRegisterPurchase = async (req, res) => {
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const deleted = await registerPurchaseService.deleteRegisterPurchase(idPurchase);
        if (!deleted) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        res.status(200).json({ message: "Compra eliminada exitosamente" }); // Código 200 y mensaje
    } catch (error) {
        console.error("Error al eliminar compra:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
const changeStateRegisterPurchase = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const updated = await registerPurchaseService.changeStateRegisterPurchase(idPurchase, req.body.state);
        if (!updated) {
            return res.status(404).json({ message: "Compra registrada no encontrada" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al cambiar estado registro de la compra:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};