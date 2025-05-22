// services/conceptSpentService.js (NUEVO - para conceptos específicos)
const conceptSpentRepository = require('../repositories/conceptSpentRepository'); // El NUEVO repositorio
const ExpenseType = require('../models/ExpenseType'); // Para validación

const createConceptSpent = async (data) => {
    // Validar que idExpenseType exista antes de crear
    const expenseTypeExists = await ExpenseType.findByPk(data.idExpenseType);
    if (!expenseTypeExists) {
        const error = new Error('El tipo de gasto general (idExpenseType) no existe.');
        // error.isOperational = true; // Puedes usar esto para identificar errores de validación de negocio
        throw error;
    }
    return conceptSpentRepository.create(data);
};

const getAllConceptSpents = async (filters = {}) => {
    return conceptSpentRepository.findAll(filters);
};

const getConceptSpentById = async (id) => {
    return conceptSpentRepository.findById(id);
};

const updateConceptSpent = async (id, data) => {
    // Si se intenta cambiar idExpenseType, validar que el nuevo exista
    if (data.idExpenseType) {
        const expenseTypeExists = await ExpenseType.findByPk(data.idExpenseType);
        if (!expenseTypeExists) {
            const error = new Error('El nuevo tipo de gasto general (idExpenseType) no existe.');
            throw error;
        }
    }
    // Asegurarse de que no se intente cambiar el idConceptSpent directamente
    const { idConceptSpent, ...updateData } = data;
    return conceptSpentRepository.update(id, updateData);
};

const deleteConceptSpent = async (id) => {
    return conceptSpentRepository.deleteById(id);
};

const changeStateConceptSpent = async (id, status) => {
    return conceptSpentRepository.update(id, { status });
};

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};