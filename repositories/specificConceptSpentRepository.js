// repositories/specificConceptSpentRepository.js
const { Op } = require('sequelize');
const SpecificConceptSpent = require('../models/SpecificConceptSpent');
const ExpenseCategory = require('../models/ExpenseCategory'); // Para includes

const create = async (data, options = {}) => {
    // 'data' ya debe incluir idExpenseCategory
    return SpecificConceptSpent.create(data, options);
};

const findAllWithOptions = async (filters = {}) => { // Renombrado para generalizar
    const queryOptions = {
        include: [{
            model: ExpenseCategory,
            as: 'expenseCategory', // El alias definido en la asociación 1-M en index.js
            attributes: ['idExpenseCategory', 'name'],
            required: false // LEFT JOIN para mostrar el concepto aunque la categoría no exista (aunque no debería pasar con FK)
        }],
        where: {},
        order: [['name', 'ASC']]
    };

    if (filters.status !== undefined) {
        queryOptions.where.status = filters.status;
    }
    if (filters.requiresEmployeeCalculation !== undefined) {
        queryOptions.where.requiresEmployeeCalculation = filters.requiresEmployeeCalculation;
    }
    if (filters.isBimonthly !== undefined) {
        queryOptions.where.isBimonthly = filters.isBimonthly;
    }

    // Filtrar por idExpenseCategory directamente en SpecificConceptSpent
    if (filters.expenseCategoryId) {
        queryOptions.where.idExpenseCategory = filters.expenseCategoryId;
    }

    console.log('[REPOSITORY scs] findAllWithOptions QueryOptions:', JSON.stringify(queryOptions, null, 2));
    return SpecificConceptSpent.findAll(queryOptions);
};

const findByIdWithDetails = async (idSpecificConcept) => { // Renombrado
    return SpecificConceptSpent.findByPk(idSpecificConcept, {
        include: [{
            model: ExpenseCategory,
            as: 'expenseCategory',
            attributes: ['idExpenseCategory', 'name'],
        }]
    });
};

const update = async (idSpecificConcept, data, options = {}) => {
    // 'data' puede incluir idExpenseCategory para cambiar la categoría
    const [numberOfAffectedRows] = await SpecificConceptSpent.update(data, {
        where: { idSpecificConcept },
        ...options
    });
    return numberOfAffectedRows;
};

const deleteById = async (idSpecificConcept, options = {}) => {
    return SpecificConceptSpent.destroy({
        where: { idSpecificConcept },
        ...options
    });
};

module.exports = {
    create,
    findAllWithOptions,
    findByIdWithDetails,
    update,
    deleteById,
};