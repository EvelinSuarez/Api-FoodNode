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

const changeStateMonthlyOverallExpense = async (id, status) => {
    return monthlyOverallExpenseRepository.changeStateMonthlyOverallExpense(id, status);
}

// Nuevas funciones para obtener el total de gastos
const getTotalExpenseByMonth = async (year, month) => {
    return monthlyOverallExpenseRepository.getTotalExpenseByMonth(year, month);
};

const getTotalExpenseByTypeAndMonth = async (year, month, idExpenseType) => {
    return monthlyOverallExpenseRepository.getTotalExpenseByTypeAndMonth(year, month, idExpenseType);
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