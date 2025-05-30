// controllers/registerPurchaseController.js
const { validationResult } = require('express-validator');
const registerPurchaseService = require('../services/registerPurchaseService');

const handleError = (res, error, context) => {
    // Mejorar el log del error en el backend
    console.error(`Error en controlador (${context}): ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }
    if (error.errors && Array.isArray(error.errors)) { // Para errores de Sequelize con múltiples items
        console.error("Detalles del error de Sequelize:", JSON.stringify(error.errors, null, 2));
    }


    const statusCode = error.statusCode || 500;
    let responseMessage = error.message || `Error interno del servidor en ${context}.`;
    
    // Si el error es de Sequelize y tiene un array de errores, úsalo
    if (error.name === 'SequelizeValidationError' && error.errors && Array.isArray(error.errors)) {
        responseMessage = error.errors.map(e => `${e.path}: ${e.message.replace(e.path, '').trim()}`).join('; ');
    } else if (error.errors && Array.isArray(error.errors)) { // Para errores de express-validator
        responseMessage = error.errors.map(e => e.msg).join('; ');
    }

    res.status(statusCode).json({ message: responseMessage });
};

const createPurchaseWithDetails = async (req, res) => {
    // ----- DEBUGGING INICIO DE CONTROLADOR -----
    // console.log("CONTROLADOR createPurchaseWithDetails - req.body RECIBIDO:", JSON.stringify(req.body, null, 2));
    // console.log(`CONTROLADOR createPurchaseWithDetails - idProvider: ${req.body.idProvider}, type: ${typeof req.body.idProvider}`);
    // console.log(`CONTROLADOR createPurchaseWithDetails - category: ${req.body.category}, type: ${typeof req.body.category}`);
    // ----- FIN DEBUGGING -----

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // express-validator ya formatea los errores en errors.array()
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newPurchase = await registerPurchaseService.processFullPurchase(req.body);
        res.status(201).json({ message: "Compra y detalles registrados exitosamente.", purchase: newPurchase });
    } catch (error) {
        handleError(res, error, "crear compra con detalles");
    }
};
// ... (resto del controlador como antes)
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await registerPurchaseService.getAll();
        // console.log("CONTROLADOR getAllPurchases - Datos ANTES de enviar a frontend:", JSON.stringify(purchases, null, 2));
        res.status(200).json(purchases);
    } catch (error) {
        handleError(res, error, "obtener todas las compras");
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
    // console.log("CONTROLADOR updatePurchaseHeader: req.body RECIBIDO:", JSON.stringify(req.body, null, 2));
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
    // console.log("CONTROLADOR updatePurchaseStatusController: req.body RECIBIDO:", JSON.stringify(req.body, null, 2));
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