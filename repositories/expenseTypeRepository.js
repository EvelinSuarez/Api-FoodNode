// repositories/expenseTypeRepository.js
const ExpenseType = require('../models/ExpenseType'); // Modelo renombrado

const create = async (data) => {
    return ExpenseType.create(data);
};

const findAll = async () => {
    return ExpenseType.findAll({ order: [['name', 'ASC']] });
};

const findById = async (idExpenseType) => {
    return ExpenseType.findByPk(idExpenseType);
};

const update = async (idExpenseType, data) => {
    return ExpenseType.update(data, { where: { idExpenseType }, returning: true }); // returning: true puede ser útil
};

const deleteById = async (idExpenseType) => {
    return ExpenseType.destroy({ where: { idExpenseType } });
};

// No necesitas changeState aquí, se maneja con update.

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteById,
};