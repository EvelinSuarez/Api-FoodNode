// repositories/monthlyOverallExpenseRepository.js
const { Op } = require('sequelize');
const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
const ExpenseCategory = require('../models/ExpenseCategory'); // Para includes

const create = async (data) => {
    return MonthlyOverallExpense.create(data);
};

const findAll = async (filters = {}) => { // Añadir filtros
    const queryOptions = {
        include: [{
            model: ExpenseCategory,
            as: 'categoryDetails', // Asegúrate que este alias esté definido en models/index.js
            attributes: ['idExpenseCategory', 'name']
        }],
        order: [['dateOverallExp', 'DESC'], ['idExpenseCategory', 'ASC']],
        where: {}
    };
    if (filters.status !== undefined) {
        queryOptions.where.status = filters.status;
    }
    if (filters.idExpenseCategory) {
        queryOptions.where.idExpenseCategory = filters.idExpenseCategory;
    }
    if (filters.year && filters.month) {
        const year = parseInt(filters.year);
        const month = parseInt(filters.month) -1; // Meses en JS son 0-indexados
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        queryOptions.where.dateOverallExp = { [Op.between]: [startDate, endDate] };
    }


    return MonthlyOverallExpense.findAll(queryOptions);
};

const findById = async (idOverallMonth) => {
    return MonthlyOverallExpense.findByPk(idOverallMonth, {
        include: [{
            model: ExpenseCategory,
            as: 'categoryDetails',
            attributes: ['idExpenseCategory', 'name']
        }]
    });
};

const update = async (idOverallMonth, data) => {
    const [numberOfAffectedRows] = await MonthlyOverallExpense.update(data, {
        where: { idOverallMonth }
    });
    return numberOfAffectedRows;
};

const deleteById = async (idOverallMonth) => {
    // Considerar si se deben eliminar MonthlyExpenseItems asociados (onDelete: 'CASCADE' en el modelo)
    return MonthlyOverallExpense.destroy({
        where: { idOverallMonth }
    });
};

// Funciones para totales
const sumValueExpenseByMonth = async (year, month) => {
    const startDate = new Date(year, month - 1, 1); // Mes -1 para Date object
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Último día del mes

    const result = await MonthlyOverallExpense.sum('valueExpense', {
        where: {
            dateOverallExp: {
                [Op.between]: [startDate, endDate],
            },
            // Podrías añadir filtro de status: true si solo quieres sumar los activos
        },
    });
    return result || 0; // Devolver 0 si no hay gastos
};

const sumValueExpenseByCategoryAndMonth = async (year, month, idExpenseCategory) => { // CAMBIO
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await MonthlyOverallExpense.sum('valueExpense', {
        where: {
            idExpenseCategory: idExpenseCategory, // CAMBIO
            dateOverallExp: {
                [Op.between]: [startDate, endDate],
            },
        },
    });
    return result || 0;
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteById,
    sumValueExpenseByMonth,
    sumValueExpenseByCategoryAndMonth, // CAMBIO
};