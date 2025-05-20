// repositories/specificConceptSpentRepository.js
const SpecificConceptSpent = require('../models/SpecificConceptSpent');
const ExpenseType = require('../models/ExpenseType');
const { Op } = require('sequelize');

const create = async (data) => {
    return SpecificConceptSpent.create(data);
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

    console.log('[REPOSITORY - ANTES DE FINDALL] Objeto Filters recibido:', JSON.stringify(filters));
    console.log('[REPOSITORY - ANTES DE FINDALL] WhereClause construida para Sequelize:', JSON.stringify(whereClause));

    return SpecificConceptSpent.findAll({
        where: whereClause,
        include: [{
            model: ExpenseType,
            as: 'expenseType',
            attributes: ['idExpenseType', 'name']
        }],
        order: [
            ['idExpenseType', 'ASC'],
            ['name', 'ASC']
        ]
    });
};

const findById = async (idSpecificConcept) => {
    return SpecificConceptSpent.findByPk(idSpecificConcept, {
        include: [{
            model: ExpenseType,
            as: 'expenseType',
            attributes: ['idExpenseType', 'name']
        }]
    });
};

const update = async (idSpecificConcept, data) => {
    return SpecificConceptSpent.update(data, { where: { idSpecificConcept } });
};

const deleteById = async (idSpecificConcept) => {
    return SpecificConceptSpent.destroy({ where: { idSpecificConcept } });
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteById,
};