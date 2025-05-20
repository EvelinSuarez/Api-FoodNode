// controllers/conceptSpentController.js (NUEVO - para conceptos específicos)
const { validationResult } = require('express-validator');
const conceptSpentService = require('../services/conceptSpentService'); // Este será el NUEVO servicio
const ExpenseType = require('../models/ExpenseType'); // Para verificar existencia del tipo general

// Crear un nuevo concepto de gasto específico
const createConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // req.body debería tener: idExpenseType, name, requiresEmployeeCalculation, status (opcional)
        const concept = await conceptSpentService.createConceptSpent(req.body);
        res.status(201).json(concept);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este concepto específico ya existe para el tipo de gasto general seleccionado.' });
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'El tipo de gasto general (idExpenseType) proporcionado no existe.' });
        }
        res.status(500).json({ message: error.message || "Error creando el concepto de gasto específico." });
    }
};

// Obtener todos los conceptos específicos
// Puede filtrarse por idExpenseType y/o status
const getAllConceptSpents = async (req, res) => {
    try {
        const { idExpenseType, status, requiresEmployeeCalculation } = req.query;
        const filters = {};
        if (idExpenseType) filters.idExpenseType = parseInt(idExpenseType, 10);
        if (status !== undefined) filters.status = (status === 'true' || status === '1');
        if (requiresEmployeeCalculation !== undefined) filters.requiresEmployeeCalculation = (requiresEmployeeCalculation === 'true' || requiresEmployeeCalculation === '1');

        const concepts = await conceptSpentService.getAllConceptSpents(filters);
        res.status(200).json(concepts);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error obteniendo los conceptos de gasto específicos." });
    }
};

// Obtener un concepto específico por su ID
const getConceptSpentById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idConceptSpent = parseInt(req.params.idConceptSpent, 10);

    try {
        const concept = await conceptSpentService.getConceptSpentById(idConceptSpent);
        if (!concept) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        res.status(200).json(concept);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error obteniendo el concepto de gasto específico." });
    }
};

// Actualizar un concepto específico
const updateConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idConceptSpent = parseInt(req.params.idConceptSpent, 10);

    try {
        // No permitir cambiar idExpenseType una vez creado, o manejarlo con cuidado.
        const { idExpenseType, ...dataToUpdate } = req.body;
        if (idExpenseType) {
            // Opcional: validar si el nuevo idExpenseType existe
            const generalTypeExists = await ExpenseType.findByPk(idExpenseType);
            if (!generalTypeExists) {
                return res.status(400).json({ message: "El nuevo tipo de gasto general (idExpenseType) no existe." });
            }
            dataToUpdate.idExpenseType = idExpenseType; // Permitir cambio si es válido
        }


        const [updated] = await conceptSpentService.updateConceptSpent(idConceptSpent, dataToUpdate);
        if (!updated) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado o sin cambios.' });
        }
        const updatedConcept = await conceptSpentService.getConceptSpentById(idConceptSpent);
        res.status(200).json(updatedConcept);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este concepto específico ya existe para el tipo de gasto general seleccionado.' });
        }
        if (error.name === 'SequelizeForeignKeyConstraintError' && error.parent.constraint === 'concept_spents_idExpenseType_fkey') { // Ajustar el nombre del constraint
             return res.status(400).json({ message: 'El tipo de gasto general (idExpenseType) proporcionado no existe.' });
        }
        res.status(500).json({ message: error.message || "Error actualizando el concepto de gasto específico." });
    }
};

// Eliminar un concepto específico
const deleteConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idConceptSpent = parseInt(req.params.idConceptSpent, 10);

    try {
        const result = await conceptSpentService.deleteConceptSpent(idConceptSpent);
        if (!result) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        res.status(204).end();
    } catch (error) {
         if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ message: 'No se puede eliminar el concepto porque está siendo usado en registros de gastos mensuales.' });
        }
        res.status(500).json({ message: error.message || "Error eliminando el concepto de gasto específico." });
    }
};

// Cambiar estado de un concepto específico
const changeStateConceptSpent = async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idConceptSpent = parseInt(req.params.idConceptSpent, 10);
    const { status } = req.body;
    if (typeof status !== 'boolean') {
        return res.status(400).json({ message: "El campo 'status' es requerido y debe ser booleano."})
    }

    try {
        const [updated] = await conceptSpentService.changeStateConceptSpent(idConceptSpent, status);
        if (!updated) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        const updatedConcept = await conceptSpentService.getConceptSpentById(idConceptSpent);
        res.status(200).json(updatedConcept);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error cambiando el estado del concepto de gasto específico." });
    }
};

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};