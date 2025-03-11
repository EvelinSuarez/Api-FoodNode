const MonthlyOverallExpense = require('../models/monthlyOverallExpense');

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

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
};
