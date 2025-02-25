const monthlyOverallExpenseRepository = require('../repositories/monthlyOverallExpenseRespositoriy');

const createMonthlyOverallExpense = async (monthlyOverallExpense) => {
    return monthlyOverallExpenseRepository.createMonthlyOverallExpense(monthlyOverallExpense);
}

const getAllMonthlyOverallExpenses = async () => {
    return monthlyOverallExpenseRepository.getAllMonthlyOverallExpenses();
}

const getMonthlyOverallExpenseById = async (id) => {
    return monthlyOverallExpenseRepository.getMonthlyOverallExpenseById(id);
}

const updateMonthlyOverallExpense = async (id, monthlyOverallExpense) => {
    return monthlyOverallExpenseRepository.updateMonthlyOverallExpense(id, monthlyOverallExpense);
}

const deleteMonthlyOverallExpense = async (id) => {
    return monthlyOverallExpenseRepository.deleteMonthlyOverallExpense(id);
}

const changeStateMonthlyOverallExpense = async (id, state) => {
    return monthlyOverallExpenseRepository.changeStateMonthlyOverallExpense(id, state);
}

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
};
