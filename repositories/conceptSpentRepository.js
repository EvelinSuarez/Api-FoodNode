// repositories/conceptSpentRepository.js (NUEVO - para conceptos específicos)
const ConceptSpent = require('../models/ConceptSpent'); // El NUEVO modelo
const ExpenseType = require('../models/ExpenseType');   // Para include
const { Op } = require('sequelize');

const create = async (data) => {
    return ConceptSpent.create(data);
};

const findAll = async (filters = {}) => {
    const whereClause = {};
    if (filters.idExpenseType) {
        whereClause.idExpenseType = filters.idExpenseType;
    }
    if (filters.status !== undefined) {
        whereClause.status = filters.status;
    }
    if (filters.requiresEmployeeCalculation !== undefined) {
        whereClause.requiresEmployeeCalculation = filters.requiresEmployeeCalculation;
    }

    return ConceptSpent.findAll({
        where: whereClause,
        include: [{
            model: ExpenseType,
            as: 'expenseType', // Alias de la relación en el modelo ConceptSpent
            attributes: ['idExpenseType', 'name']
        }],
        order: [
            [ExpenseType, 'name', 'ASC'], // Ordenar por nombre del tipo general
            ['name', 'ASC']                // Luego por nombre del concepto específico
        ]
    });
};

const findById = async (idConceptSpent) => {
    return ConceptSpent.findByPk(idConceptSpent, {
        include: [{
            model: ExpenseType,
            as: 'expenseType',
            attributes: ['idExpenseType', 'name']
        }]
    });
};

const update = async (idConceptSpent, data) => {
    return ConceptSpent.update(data, { where: { idConceptSpent } });
};

const deleteById = async (idConceptSpent) => {
    return ConceptSpent.destroy({ where: { idConceptSpent } });
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteById,
};