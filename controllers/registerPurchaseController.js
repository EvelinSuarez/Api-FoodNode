// controllers/registerPurchaseController.js
const { validationResult } = require('express-validator');
const registerPurchaseService = require('../services/registerPurchaseService'); // Servicio del backend

// --- CREAR O ACTUALIZAR COMPRA (USA LA NUEVA LÓGICA DEL SERVICIO) ---
const createRegisterPurchase = async (req, res) => {
    // 1. Validar entrada usando express-validator (reglas definidas en las rutas)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // 2. Llamar a la función del servicio que maneja la lógica de crear o actualizar
    try {
        // Pasa el cuerpo de la solicitud al servicio
        const result = await registerPurchaseService.processPurchaseSubmission(req.body);

        // 3. Determinar el código de estado (201 si se creó, 200 si se actualizó)
        const statusCode = result.created ? 201 : 200;
        const actionMessage = result.created ? "Compra registrada exitosamente." : "Compra existente actualizada exitosamente.";

        // 4. Devolver respuesta exitosa con el estado y la compra resultante
        // El repo (llamado por el servicio) debe incluir los detalles para esta respuesta
        res.status(statusCode).json({ message: actionMessage, purchase: result.purchase });

    } catch (error) {
        // 5. Manejar errores del servicio (DB, validaciones internas, etc.)
        console.error("Error en controlador al procesar la compra:", error); // Loguear error en servidor
        // Devolver un error 500 genérico o más específico si es posible
        res.status(500).json({ message: error.message || "Error interno del servidor al procesar la compra." });
    }
};

// --- OBTENER TODAS LAS COMPRAS ---
const getAllRegisterPurchases = async (req, res) => {
    try {
        // Llama a la función del servicio para obtener todas (el repo debe incluir relaciones)
        const registerPurchases = await registerPurchaseService.getAllRegisterPurchases();
        res.status(200).json(registerPurchases);
    } catch (error) {
        console.error("Error en controlador al obtener compras:", error);
        res.status(500).json({ message: error.message || "Error interno del servidor al obtener compras." });
    }
};

// --- OBTENER UNA COMPRA POR ID ---
const getRegisterPurchaseById = async (req, res) => {
    // La validación del ID (que sea número) debe hacerse en el middleware de rutas
    const idPurchase = parseInt(req.params.idPurchase, 10);
     if (isNaN(idPurchase)){ // Doble chequeo
         return res.status(400).json({ message: "ID de compra inválido." });
    }

    try {
        // Llama al servicio (el repo debe incluir relaciones)
        const registerPurchase = await registerPurchaseService.getRegisterPurchaseById(idPurchase);
        if (!registerPurchase) {
            // Si el servicio devuelve null/undefined, no se encontró
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        // Devolver 200 OK con la compra
        res.status(200).json(registerPurchase);
    } catch (error) {
        console.error(`Error en controlador al obtener compra ID ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al obtener la compra." });
    }
};

// --- ACTUALIZAR COMPRA (REVISAR SI AÚN ES NECESARIA ESTA RUTA/FUNCIÓN SEPARADA) ---
// Esta función ahora podría ser redundante o necesitar una lógica diferente
// si 'createRegisterPurchase' ya maneja las actualizaciones de detalles.
// Podría servir para actualizar SÓLO la cabecera (ej: fecha, estado).
const updateRegisterPurchase = async (req, res) => {
    // Validaciones del ID (param) y cuerpo (body) hechas en el middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPurchase = parseInt(req.params.idPurchase, 10);

    try {
        // Llama a la función de actualización del servicio.
        // ¡Asegúrate que esta función exista en tu servicio y haga lo que esperas!
        // (La exportación estaba comentada en el servicio de ejemplo)
        const updated = await registerPurchaseService.updateRegisterPurchase(idPurchase, req.body);
        if (!updated) {
             // Podría no encontrarse o no haber cambios
             return res.status(404).json({ message: "Compra no encontrada o sin cambios para actualizar." });
        }
        res.status(200).json({ message: "Actualización de compra (cabecera) procesada." });
    } catch (error) {
        console.error(`Error en controlador al actualizar compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al actualizar." });
    }
};

// --- ELIMINAR COMPRA ---
const deleteRegisterPurchase = async (req, res) => {
    // Validación del ID en el middleware
    const idPurchase = parseInt(req.params.idPurchase, 10);
     if (isNaN(idPurchase)){
         return res.status(400).json({ message: "ID de compra inválido." });
    }

    try {
        const deleted = await registerPurchaseService.deleteRegisterPurchase(idPurchase);
        if (!deleted) {
             return res.status(404).json({ message: "Compra no encontrada para eliminar." });
        }
        res.status(200).json({ message: "Compra eliminada exitosamente." });
    } catch (error) {
        console.error(`Error en controlador al eliminar compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al eliminar." });
    }
};

// --- CAMBIAR ESTADO DE COMPRA ---
const changeStateRegisterPurchase = async (req, res) => {
    // Validaciones del ID y del estado en el middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPurchase = parseInt(req.params.idPurchase, 10);
    const status = req.body.status; // El middleware ya validó el tipo/valor

    try {
        const updated = await registerPurchaseService.changeStateRegisterPurchase(idPurchase, status);
        if (!updated) {
             return res.status(404).json({ message: "Compra no encontrada para cambiar estado." });
        }
        res.status(204).end(); // 204 No Content es apropiado para éxito sin cuerpo
    } catch (error) {
        console.error(`Error en controlador al cambiar estado de compra ${idPurchase}:`, error);
        res.status(500).json({ message: error.message || "Error interno del servidor al cambiar estado." });
    }
};

// --- EXPORTAR TODAS LAS FUNCIONES DEL CONTROLADOR ---
// Asegúrate de que todos los nombres aquí coincidan con los usados en tu archivo de rutas
module.exports = {
    createRegisterPurchase,   // <--- ¡Asegurada la exportación!
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,   // Mantener si la ruta PUT todavía la usa
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};