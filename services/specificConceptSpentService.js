// services/specificConceptSpentService.js
const specificConceptSpentRepository = require('../repositories/specificConceptSpentRepository');
const ExpenseType = require('../models/ExpenseType'); // Para validación de existencia de ExpenseType

const createSpecificConceptSpent = async (data) => {
    const expenseTypeExists = await ExpenseType.findByPk(data.idExpenseType);
    if (!expenseTypeExists) {
        const error = new Error('El tipo de gasto general (idExpenseType) no existe.');
        throw error;
    }
    return specificConceptSpentRepository.create(data);
};

const getAllSpecificConceptSpents = async (filters = {}) => {
    console.log('[SERVICE - specificConceptSpentService] Filters recibidos del controlador:', JSON.stringify(filters));
    return specificConceptSpentRepository.findAll(filters);
};

const getSpecificConceptSpentById = async (idSpecificConcept) => {
    return specificConceptSpentRepository.findById(idSpecificConcept);
};

const updateSpecificConceptSpent = async (idSpecificConcept, data) => {
    if (data.idExpenseType) {
        const expenseTypeExists = await ExpenseType.findByPk(data.idExpenseType);
        if (!expenseTypeExists) {
            const error = new Error('El nuevo tipo de gasto general (idExpenseType) proporcionado no existe.');
            throw error;
        }
    }
    const { idSpecificConcept: bodyId, ...updateData } = data;
    return specificConceptSpentRepository.update(idSpecificConcept, updateData);
};

const deleteSpecificConceptSpent = async (idSpecificConcept) => {
    return specificConceptSpentRepository.deleteById(idSpecificConcept);
};

const changeStateSpecificConceptSpent = async (idSpecificConcept, status) => {
    return specificConceptSpentRepository.update(idSpecificConcept, { status });
};

module.exports = {
    createSpecificConceptSpent,
    getAllSpecificConceptSpents,
    getSpecificConceptSpentById,
    updateSpecificConceptSpent,
    deleteSpecificConceptSpent,
    changeStateSpecificConceptSpent,
};