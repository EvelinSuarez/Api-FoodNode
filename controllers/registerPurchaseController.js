// Archivo: controllers/registerPurchaseController.js

const { validationResult } = require('express-validator');
const registerPurchaseService = require('../services/registerPurchaseService');

// Función centralizada para manejar errores en el controlador
const handleError = (res, error, context) => {
    console.error(`Error en controlador (${context}): ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }

    const statusCode = error.statusCode || 500;
    const responseMessage = error.message || `Error interno del servidor en ${context}.`;
    
    res.status(statusCode).json({ message: responseMessage });
};

const createPurchaseWithDetails = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newPurchase = await registerPurchaseService.processFullPurchase(req.body);
        res.status(201).json({ message: "Compra y detalles registrados exitosamente.", purchase: newPurchase });
    } catch (error) {
        handleError(res, error, "crear compra con detalles");
    }
};

const getAllPurchases = async (req, res) => {
    try {
        // <<< --- CORRECCIÓN CLAVE --- >>>
        // Se utiliza la función del servicio que garantiza la inclusión de todos los detalles anidados.
        const purchases = await registerPurchaseService.getAllRegisterPurchasesWithDetails();
        res.status(200).json(purchases);
    } catch (error) {
        handleError(res, error, "obtener todas las compras con detalles");
    }
};

const getPurchaseById = async (req, res) => {
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) { 
        return res.status(400).json({ message: "El ID de la compra debe ser un número." });
    }
    try {
        const purchase = await registerPurchaseService.getById(idPurchase);
        res.status(200).json(purchase);
    } catch (error) {
        handleError(res, error, `obtener compra ID ${idPurchase}`);
    }
};

const updatePurchaseHeader = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID de la compra debe ser un número." });
    }
    try {
        const updatedPurchase = await registerPurchaseService.updateHeader(idPurchase, req.body);
        res.status(200).json({ message: "Cabecera de compra actualizada.", purchase: updatedPurchase });
    } catch (error) {
        handleError(res, error, `actualizar cabecera de compra ${idPurchase}`);
    }
};

const deletePurchaseById = async (req, res) => {
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID de la compra debe ser un número." });
    }
    try {
        const result = await registerPurchaseService.deleteById(idPurchase);
        res.status(200).json(result);
    } catch (error) {
        handleError(res, error, `eliminar compra ${idPurchase}`);
    }
};

const updatePurchaseStatusController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const idPurchase = parseInt(req.params.idPurchase, 10);
    if (isNaN(idPurchase)) {
        return res.status(400).json({ message: "El ID de la compra debe ser un número." });
    }
    const { status, paymentStatus } = req.body;
  
    try {
      const updatedPurchase = await registerPurchaseService.updatePurchaseStatus(idPurchase, { status, paymentStatus });
      res.status(200).json({ message: "Estado(s) de la compra actualizados.", purchase: updatedPurchase });
    } catch (error) {
      handleError(res, error, `actualizar estado(s) de compra ${idPurchase}`);
    }
};

async function getProvidersByCategoryController(req, res) {
    try {
        const categoryName = "CARNE"; 
        const providers = await registerPurchaseService.getProvidersByCategory(categoryName);
        res.status(200).json(providers);
    } catch (error) {
        handleError(res, error, `obtener proveedores por categoría CARNE`);
    }
}

module.exports = {
    createPurchaseWithDetails,
    getAllPurchases,
    getPurchaseById,
    updatePurchaseHeader,
    deletePurchaseById,
    updatePurchaseStatusController,
    getProvidersByCategoryController,
};