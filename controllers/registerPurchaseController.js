// controllers/registerPurchaseController.js
const { validationResult } = require('express-validator');
const registerPurchaseService = require('../services/registerPurchaseService');

const createRegisterPurchase = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const result = await registerPurchaseService.processPurchaseSubmission(req.body);
        const statusCode = result.created ? 201 : 200;
        const actionMessage = result.created ? "Compra registrada exitosamente." : "Compra existente actualizada exitosamente.";
        res.status(statusCode).json({ message: actionMessage, purchase: result.purchase });
    } catch (error) {
        console.error("Error en controlador al procesar la compra:", error);
        res.status(500).json({ message: error.message || "Error interno del servidor al procesar la compra." });
    }
};

async function getProvidersFromMeatCategory(req, res) {
    try {
        // Asume que la categoría "CARNE" es la que se busca. Ajustar si es necesario.
        const providers = await registerPurchaseService.getProvidersByCategory("CARNE");
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al obtener proveedores de carne." });
    }
}

const getAllRegisterPurchases = async (req, res) => {
    try {
        const registerPurchases = await registerPurchaseService.getAllRegisterPurchases();
        res.status(200).json(registerPurchases);
    } catch (error) {
        console.error("Error en controlador al obtener compras:", error);
        res.status(500).json({ message: error.message || "Error interno del servidor al obtener compras." });
    }
};

const getRegisterPurchaseById = async (req, res) => {
    // La validación del ID ya se hizo en el middleware (validateIdParam)
    // y este incluye la verificación de existencia.
    const idPurchase = parseInt(req.params.idPurchase, 10); // El middleware ya lo validó como entero.

    try {
        const registerPurchase = await registerPurchaseService.getRegisterPurchaseById(idPurchase);
        // La validación de existencia ya la hizo el middleware, por lo que aquí siempre debería encontrarlo.
        // No obstante, una doble comprobación no daña:
        if (!registerPurchase) {
             // Esto no debería ocurrir si validateIdParam incluye .custom(validateRegisterPurchaseExistence)
            return res.status(404).json({ message: "Compra no encontrada." });
        }
        res.status(200).json(registerPurchase);
    } catch (error) {
        console.error(`Error en controlador al obtener compra ID ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al obtener la compra." });
    }
};

const updateRegisterPurchase = async (req, res) => {
    // La validación del ID (param) y cuerpo (body) ya fueron hechas en el middleware.
    const errors = validationResult(req); // Aunque las validaciones principales están en el middleware,
                                        // es buena práctica verificar aquí también por si acaso.
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPurchase = parseInt(req.params.idPurchase, 10);

    try {
        // Esta ruta PUT es para actualizar la cabecera de la compra (fecha, categoría, estado, etc.)
        // No debería usarse para modificar detalles. Para eso está el POST (processPurchaseSubmission).
        // El servicio `updatePurchaseHeader` ahora devuelve la compra actualizada o null.
        const updatedPurchase = await registerPurchaseService.updatePurchaseHeader(idPurchase, req.body);
        
        if (!updatedPurchase) {
             // Esto puede significar que no se encontró o que no hubo campos válidos para actualizar.
             // El repo.updateRegisterPurchase devuelve true/false. El servicio lo convierte.
             return res.status(404).json({ message: "Compra no encontrada o sin cambios válidos para actualizar." });
        }
        res.status(200).json({ message: "Cabecera de compra actualizada exitosamente.", purchase: updatedPurchase });
    } catch (error) {
        console.error(`Error en controlador al actualizar compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al actualizar." });
    }
};

const deleteRegisterPurchase = async (req, res) => {
    // ID validado y existencia comprobada por middleware.
    const idPurchase = parseInt(req.params.idPurchase, 10);

    try {
        const deleted = await registerPurchaseService.deleteRegisterPurchase(idPurchase);
        // Si el middleware validó la existencia, deleted debería ser true.
        if (!deleted) {
             // No debería ocurrir si validateIdParam incluye .custom(validateRegisterPurchaseExistence)
             return res.status(404).json({ message: "Compra no encontrada para eliminar." });
        }
        res.status(200).json({ message: "Compra eliminada exitosamente." }); // O 204 No Content
    } catch (error) {
        console.error(`Error en controlador al eliminar compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al eliminar." });
    }
};

const changeStateRegisterPurchase = async (req, res) => {
    // ID y 'status' validados por middleware.
    const errors = validationResult(req); // Chequeo redundante pero seguro.
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPurchase = parseInt(req.params.idPurchase, 10);
    const { status } = req.body;

    try {
        const updated = await registerPurchaseService.changeStateRegisterPurchase(idPurchase, status);
        if (!updated) {
            // No debería ocurrir si el middleware validó existencia.
             return res.status(404).json({ message: "Compra no encontrada para cambiar estado." });
        }
        res.status(204).end();
    } catch (error) {
        console.error(`Error en controlador al cambiar estado de compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al cambiar estado." });
    }
};

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getProvidersFromMeatCategory,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};