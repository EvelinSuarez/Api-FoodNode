// controllers/expenseCategoryController.js
const { validationResult } = require('express-validator');
const expenseCategoryService = require('../services/expenseCategoryService');

const createExpenseCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const expenseCategory = await expenseCategoryService.createExpenseCategory(req.body);
        res.status(201).json(expenseCategory);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') { // Captura de unicidad del modelo
            return res.status(409).json({ message: 'El nombre de la categoría de gasto ya existe.' });
        }
        console.error("Error en createExpenseCategory:", error);
        res.status(500).json({ message: error.message || 'Error creando la categoría de gasto.' });
    }
};

const getAllExpenseCategories = async (req, res) => {
    try {
        // Pasar query params como filtros si los tienes (ej: status)
        const filters = {};
        if (req.query.status !== undefined) {
            filters.status = req.query.status === 'true';
        }
        const expenseCategories = await expenseCategoryService.getAllExpenseCategories(filters);
        res.status(200).json(expenseCategories);
    } catch (error) {
        console.error("Error en getAllExpenseCategories:", error);
        res.status(500).json({ message: error.message || 'Error obteniendo las categorías de gasto.' });
    }
};

const getExpenseCategoryById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseCategory = parseInt(req.params.idExpenseCategory, 10);

    try {
        const expenseCategory = await expenseCategoryService.getExpenseCategoryById(idExpenseCategory);
        if (!expenseCategory) {
            return res.status(404).json({ message: 'Categoría de gasto no encontrada.' });
        }
        res.status(200).json(expenseCategory);
    } catch (error) {
        console.error("Error en getExpenseCategoryById:", error);
        res.status(500).json({ message: error.message || 'Error obteniendo la categoría de gasto.' });
    }
};

const updateExpenseCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseCategory = parseInt(req.params.idExpenseCategory, 10);

    try {
        const affectedRows = await expenseCategoryService.updateExpenseCategory(idExpenseCategory, req.body);
        if (affectedRows === 0) {
            // Verificar si realmente no existía o si los datos eran iguales
            const exists = await expenseCategoryService.getExpenseCategoryById(idExpenseCategory);
            if (!exists) {
                return res.status(404).json({ message: 'Categoría de gasto no encontrada.' });
            }
            // Si existe pero affectedRows es 0, los datos eran los mismos. Devolver el objeto existente.
            return res.status(200).json(exists);
        }
        const updatedExpenseCategory = await expenseCategoryService.getExpenseCategoryById(idExpenseCategory);
        res.status(200).json(updatedExpenseCategory);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'El nombre de la categoría de gasto ya existe.' });
        }
        console.error("Error en updateExpenseCategory:", error);
        res.status(500).json({ message: error.message || 'Error actualizando la categoría de gasto.' });
    }
};

const deleteExpenseCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseCategory = parseInt(req.params.idExpenseCategory, 10);

    try {
        const affectedRows = await expenseCategoryService.deleteExpenseCategory(idExpenseCategory);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría de gasto no encontrada.' });
        }
        res.status(204).end(); // No Content
    } catch (error)
        { // Capturar el error de restricción de FK lanzado por el servicio
        if (error.statusCode === 409) {
            return res.status(409).json({ message: error.message });
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') { // Fallback si el servicio no lanza error custom
            return res.status(409).json({ message: 'No se puede eliminar la categoría porque está en uso.' });
        }
        console.error("Error en deleteExpenseCategory:", error);
        res.status(500).json({ message: error.message || 'Error eliminando la categoría de gasto.' });
    }
};

const changeStateExpenseCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idExpenseCategory = parseInt(req.params.idExpenseCategory, 10);
    const { status } = req.body;
    // La validación del middleware ya verifica que status sea booleano y exista

    try {
        const affectedRows = await expenseCategoryService.changeStateExpenseCategory(idExpenseCategory, status);
        if (affectedRows === 0) {
            const exists = await expenseCategoryService.getExpenseCategoryById(idExpenseCategory);
             if (!exists) {
                return res.status(404).json({ message: 'Categoría de gasto no encontrada.' });
            }
            return res.status(200).json(exists); // No cambió porque el estado ya era ese
        }
        const updatedExpenseCategory = await expenseCategoryService.getExpenseCategoryById(idExpenseCategory);
        res.status(200).json(updatedExpenseCategory);
    } catch (error) {
        console.error("Error en changeStateExpenseCategory:", error);
        res.status(500).json({ message: error.message || 'Error cambiando el estado de la categoría de gasto.' });
    }
};

module.exports = {
    createExpenseCategory,
    getAllExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
    changeStateExpenseCategory,
};