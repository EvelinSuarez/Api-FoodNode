const { validationResult } = require('express-validator');
const monthlyOverallExpenseService = require('../services/monthlyOverallExpenseService');  // Cambiar a servicio de MonthlyOverallExpense

const createMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const monthlyOverallExpense = await monthlyOverallExpenseService.createMonthlyOverallExpense(req.body);
        res.status(201).json(monthlyOverallExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllMonthlyOverallExpenses = async (req, res) => {
    try {
        const monthlyOverallExpenses = await monthlyOverallExpenseService.getAllMonthlyOverallExpenses();
        res.status(200).json(monthlyOverallExpenses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getMonthlyOverallExpenseById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const monthlyOverallExpense = await monthlyOverallExpenseService.getMonthlyOverallExpenseById(req.params.id);
        res.status(200).json(nse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const updateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await monthlyOverallExpenseService.updateMonthlyOverallExpense(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await monthlyOverallExpenseService.deleteMonthlyOverallExpense(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const changeStateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await monthlyOverallExpenseService.changeStateMonthlyOverallExpense(req.params.id, req.body.state);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
};
