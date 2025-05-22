// controllers/specificConceptSpentController.js
const { validationResult } = require('express-validator');
const specificConceptSpentService = require('../services/specificConceptSpentService');

const createSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // req.body ahora debe contener idExpenseCategory (singular) y los demás campos.
        const concept = await specificConceptSpentService.createSpecificConceptSpent(req.body);
        res.status(201).json(concept);
    } catch (error) {
        console.error("Error en createSpecificConceptSpent Controller:", error);
        // El servicio ahora lanza errores más específicos
        if (error.message && (error.message.toLowerCase().includes('ya existe un concepto') || error.message.toLowerCase().includes('categoría de gasto'))) {
            return res.status(409).json({ message: error.message }); // 409 para conflicto (ya existe), 400 para FK inválida
        }
        res.status(500).json({ message: error.message || "Error creando el concepto de gasto específico." });
    }
};

const getAllSpecificConceptSpents = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const filters = {};
        const { expenseCategoryId, status, requiresEmployeeCalculation, isBimonthly } = req.query;

        if (expenseCategoryId) filters.expenseCategoryId = parseInt(expenseCategoryId, 10);
        if (status !== undefined) filters.status = (status === 'true' || status === '1' || status === true); // Ajuste para booleanos
        if (requiresEmployeeCalculation !== undefined) filters.requiresEmployeeCalculation = (requiresEmployeeCalculation === 'true' || requiresEmployeeCalculation === '1' || requiresEmployeeCalculation === true);
        if (isBimonthly !== undefined) filters.isBimonthly = (isBimonthly === 'true' || isBimonthly === '1' || isBimonthly === true);

        console.log('[CONTROLLER scs] Filters para getAll:', JSON.stringify(filters));
        const concepts = await specificConceptSpentService.getAllSpecificConceptSpents(filters);
        res.status(200).json(concepts);
    } catch (error) {
        console.error("Error en getAllSpecificConceptSpents:", error);
        res.status(500).json({ message: error.message || "Error obteniendo los conceptos de gasto específicos." });
    }
};

const getSpecificConceptSpentById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // El middleware validateSpecificConceptExistence ya maneja el 404 si no existe
        return res.status(400).json({ errors: errors.array() });
    }
    // req.specificConcept es adjuntado por el middleware validateSpecificConceptExistence
    res.status(200).json(req.specificConcept);
};

const updateSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);
    // req.body puede contener idExpenseCategory (singular)

    try {
        const result = await specificConceptSpentService.updateSpecificConceptSpent(idSpecificConcept, req.body);

        // El servicio ahora devuelve { updated: boolean, concept: object }
        if (!result.updated) {
            return res.status(200).json({ message: 'Concepto no modificado (datos iguales o no se proveyeron cambios).', data: result.concept });
        }
        
        res.status(200).json(result.concept);
    } catch (error) {
        console.error("Error en updateSpecificConceptSpent Controller:", error);
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message && (error.message.toLowerCase().includes('ya existe otro concepto') || error.message.toLowerCase().includes('categoría de gasto'))) {
            return res.status(error.message.toLowerCase().includes('ya existe') ? 409 : 400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Error actualizando el concepto de gasto específico." });
    }
};

const deleteSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // El middleware ya valida existencia
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);

    try {
        const affectedRows = await specificConceptSpentService.deleteSpecificConceptSpent(idSpecificConcept);
        // El servicio ya lanza error 404 si no existe o 409 si está en uso
        if (affectedRows === 0) { // Esto no debería pasar si el servicio maneja 404
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado (inesperado).' });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error en deleteSpecificConceptSpent Controller:", error);
        if (error.statusCode === 404 || error.statusCode === 409) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Error eliminando el concepto de gasto específico." });
    }
};

const changeStateSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);
    const { status } = req.body; // El middleware valida que sea booleano

    try {
        const affectedRows = await specificConceptSpentService.changeStateSpecificConceptSpent(idSpecificConcept, status);
        const updatedConcept = await specificConceptSpentService.getSpecificConceptSpentById(idSpecificConcept); // Obtener el concepto actualizado para devolverlo

        if (!updatedConcept) { // Si por alguna razón no se encuentra después de actualizar (raro)
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado después de intentar cambiar estado.' });
        }
        
        if (affectedRows === 0 && updatedConcept.status === status) {
            // No hubo cambio porque el estado ya era el deseado
             return res.status(200).json({ message: 'El estado del concepto ya era el solicitado.', data: updatedConcept });
        }
        
        res.status(200).json(updatedConcept);
    } catch (error) {
        console.error("Error en changeStateSpecificConceptSpent:", error);
        // El servicio getSpecificConceptSpentById podría lanzar 404 si falla
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Error cambiando el estado del concepto de gasto específico." });
    }
};

module.exports = {
    createSpecificConceptSpent,
    getAllSpecificConceptSpents,
    getSpecificConceptSpentById,
    updateSpecificConceptSpent,
    deleteSpecificConceptSpent,
    changeStateSpecificConceptSpent,
};