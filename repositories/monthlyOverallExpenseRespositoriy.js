const MonthlyOverallExpense = require('../models/monthlyOverallExpense');
const { Op } = require('sequelize');

const createMonthlyOverallExpense = async (monthlyOverallExpense) => {
    return MonthlyOverallExpense.create(monthlyOverallExpense);
}

const getAllMonthlyOverallExpenses = async () => {
    return MonthlyOverallExpense.findAll();
}

const getMonthlyOverallExpenseById = async (idOverallMonth) => {
    return MonthlyOverallExpense.findByPk(idOverallMonth);
}

const updateMonthlyOverallExpense = async (idOverallMonth, monthlyOverallExpense) => {
    return MonthlyOverallExpense.update(monthlyOverallExpense, { where: { idOverallMonth } });
}

const deleteMonthlyOverallExpense = async (idOverallMonth) => {
    return MonthlyOverallExpense.destroy({ where: { idOverallMonth } });
}

const changeStateMonthlyOverallExpense = async (idOverallMonth, status) => {
    return MonthlyOverallExpense.update({ status }, { where: { idOverallMonth } });
}

// Nuevas funciones para acceder a los datos
const getTotalExpenseByMonth = async (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return MonthlyOverallExpense.sum('valueExpense', {
        where: {
            dateOverallExp: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
        },
    });
};

const getTotalExpenseByTypeAndMonth = async (year, month, idExpenseType) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return MonthlyOverallExpense.sum('valueExpense', {
        where: {
            idExpenseType: idExpenseType,
            dateOverallExp: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
        },
    });
};


module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
    getTotalExpenseByMonth,
    getTotalExpenseByTypeAndMonth,
};