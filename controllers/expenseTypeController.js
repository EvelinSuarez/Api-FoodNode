// controllers/expenseTypeController.js
const { validationResult } = require('express-validator');
const expenseTypeService = require('../services/expenseTypeService'); // Renombrado

const createExpenseType = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const expenseType = await expenseTypeService.createExpenseType(req.body);
        res.status(201).json(expenseType);
    } catch (error) {
        // Si el error es por nombre duplicado (SequelizeUniqueConstraintError)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'El nombre del tipo de gasto ya existe.' });
        }
        res.status(500).json({ message: error.message || 'Error creando el tipo de gasto.' });
    }
};

const getAllExpenseTypes = async (req, res) => {
    try {
        const expenseTypes = await expenseTypeService.getAllExpenseTypes();
        res.status(200).json(expenseTypes);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error obteniendo los tipos de gasto.' });
    }
};

const getExpenseTypeById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10); // El parámetro de ruta sigue siendo idExpenseType

    try {
        const expenseType = await expenseTypeService.getExpenseTypeById(idExpenseType);
        if (!expenseType) {
            return res.status(404).json({ message: 'Tipo de gasto no encontrado.' });
        }
        res.status(200).json(expenseType);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error obteniendo el tipo de gasto.' });
    }
};

const updateExpenseType = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10);

    try {
        const [updated] = await expenseTypeService.updateExpenseType(idExpenseType, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Tipo de gasto no encontrado o sin cambios.' });
        }
        const updatedExpenseType = await expenseTypeService.getExpenseTypeById(idExpenseType);
        res.status(200).json(updatedExpenseType);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'El nombre del tipo de gasto ya existe.' });
        }
        res.status(500).json({ message: error.message || 'Error actualizando el tipo de gasto.' });
    }
};

const deleteExpenseType = async (req, res) => {
    // Considerar validaciones adicionales: ¿Se puede eliminar si tiene conceptos específicos asociados?
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseType = parseInt(req.params.idExpenseType, 10);

    try {
        const result = await expenseTypeService.deleteExpenseType(idExpenseType);
        if (!result) {
            return res.status(404).json({ message: 'Tipo de gasto no encontrado.' });
        }
        res.status(204).end();
    } catch (error) {
        // Si hay una restricción de FK (SequelizeForeignKeyConstraintError)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ message: 'No se puede eliminar el tipo de gasto porque tiene conceptos específicos o registros mensuales asociados.' });
        }
        res.status(500).json({ message: error.message || 'Error eliminando el tipo de gasto.' });
    }
};

const changeStateExpenseType = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idExpenseType = parseInt(req.params.idExpenseType, 10);
    const { status } = req.body;
     if (typeof status !== 'boolean') {
        return res.status(400).json({ message: "El campo 'status' es requerido y debe ser booleano."})
    }

    try {
        const [updated] = await expenseTypeService.changeStateExpenseType(idExpenseType, status);
         if (!updated) {
            return res.status(404).json({ message: 'Tipo de gasto no encontrado.' });
        }
        const updatedExpenseType = await expenseTypeService.getExpenseTypeById(idExpenseType);
        res.status(200).json(updatedExpenseType);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error cambiando el estado del tipo de gasto.' });
    }
};

module.exports = {
    createExpenseType,
    getAllExpenseTypes,
    getExpenseTypeById,
    updateExpenseType,
    deleteExpenseType,
    changeStateExpenseType,
};