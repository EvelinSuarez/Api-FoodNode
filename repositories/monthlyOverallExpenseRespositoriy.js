const MonthlyOverallExpense = require('../models/monthlyOverallExpense');

const createMonthlyOverallExpense = async (monthlyOverallExpense) => {
    return MonthlyOverallExpense.create(monthlyOverallExpense);
}

const getAllMonthlyOverallExpenses = async () => {
    return MonthlyOverallExpense.findAll();
}

const getMonthlyOverallExpenseById = async (id) => {
    return MonthlyOverallExpense.findByPk(id);
}

const updateMonthlyOverallExpense = async (id, monthlyOverallExpense) => {
    return MonthlyOverallExpense.update(monthlyOverallExpense, { where: { id } });
}

const deleteMonthlyOverallExpense = async (id) => {
    return MonthlyOverallExpense.destroy({ where: { id } });
}

const changeStateMonthlyOverallExpense = async (id, state) => {
    return MonthlyOverallExpense.update({ state }, { where: { id } });
}

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
};
