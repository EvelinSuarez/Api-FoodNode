const { validationResult } = require('express-validator');
const monthlyOverallExpenseService = require('../services/monthlyOverallExpenseService'); 

const createMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const monthlyOverallExpense = await monthlyOverallExpenseService.createMonthlyOverallExpense(req.body);
        res.status(201).json(monthlyOverallExpense);
    } catch (error) {
        console.error("Error al crear gasto mensual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getAllMonthlyOverallExpenses = async (req, res) => {
    try {
        const monthlyOverallExpenses = await monthlyOverallExpenseService.getAllMonthlyOverallExpenses();
        res.status(200).json(monthlyOverallExpenses);
    } catch (error) {
        console.error("Error al obtener gastos mensuales:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getMonthlyOverallExpenseById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const monthlyOverallExpense = await monthlyOverallExpenseService.getMonthlyOverallExpenseById(id);
        if (!monthlyOverallExpense) {
            return res.status(404).json({ message: "Gasto mensual no encontrado" });
        }
        res.status(200).json(monthlyOverallExpense);
    } catch (error) {
        console.error("Error al obtener gasto mensual por ID:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const updateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const updated = await monthlyOverallExpenseService.updateMonthlyOverallExpense(id, req.body);
        if (!updated) {
            return res.status(404).json({ message: "Gasto mensual no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al actualizar gasto mensual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const deleteMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const deleted = await monthlyOverallExpenseService.deleteMonthlyOverallExpense(id);
        if (!deleted) {
            return res.status(404).json({ message: "Gasto mensual no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al eliminar gasto mensual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const changeStateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }

    try {
        const updated = await monthlyOverallExpenseService.changeStateMonthlyOverallExpense(id, req.body.state);
        if (!updated) {
            return res.status(404).json({ message: "Gasto mensual no encontrado" });
        }
        res.status(204).end();
    } catch (error) {
        console.error("Error al cambiar estado del gasto mensual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
};
