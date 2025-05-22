// controllers/monthlyOverallExpenseController.js
const { validationResult } = require('express-validator');
const monthlyOverallExpenseService = require('../services/monthlyOverallExpenseService');

const createMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // req.body ya no contendrá idExpenseCategory en el nivel principal.
        // Contendrá dateOverallExp, valueExpense, noveltyExpense, status, y expenseItems.
        // Las validaciones ya se hicieron cargo de la estructura de expenseItems.
        // El frontend envía 'noveltyExpense', el modelo puede tener 'novelty_expense'.
        // El servicio y repositorio deberían manejar la propiedad con el nombre que espera el modelo.
        // Si el modelo espera 'novelty_expense', hay que mapearlo.
        // Por ahora, asumo que el payload del frontend y el modelo usan 'noveltyExpense' (camelCase)
        // o que el ORM maneja el mapeo si hay `field: 'novelty_expense'` en el modelo.

        const dataToCreate = { ...req.body };
        // Si tu modelo MonthlyOverallExpense usa 'novelty_expense' (snake_case)
        // pero el frontend envía 'noveltyExpense' (camelCase), necesitas mapear:
        if (dataToCreate.hasOwnProperty('noveltyExpense') && !dataToCreate.hasOwnProperty('novelty_expense')) {
            dataToCreate.novelty_expense = dataToCreate.noveltyExpense;
            delete dataToCreate.noveltyExpense;
        }


        const monthlyOverallExpense = await monthlyOverallExpenseService.createMonthlyOverallExpense(dataToCreate);
        res.status(201).json(monthlyOverallExpense);
    } catch (error) {
        console.error("Error al crear gasto mensual:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || error.message || "Error interno del servidor";
        const statusCode = error.response?.status || error.statusCode || 500;
        res.status(statusCode).json({ message: errorMsg, errors: error.response?.data?.errors });
    }
};

const getAllMonthlyOverallExpenses = async (req, res) => {
    const errors = validationResult(req); // Para los query params
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const filters = {};
        const { status, year, month } = req.query; // idExpenseCategory eliminado de aquí

        if (status !== undefined) filters.status = (status === 'true' || status === '1' || status === true);
        if (year) filters.year = parseInt(year, 10);
        if (month) filters.month = parseInt(month, 10);

        const monthlyOverallExpenses = await monthlyOverallExpenseService.getAllMonthlyOverallExpenses(filters);
        res.status(200).json(monthlyOverallExpenses);
    } catch (error) {
        console.error("Error al obtener gastos mensuales:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Error interno del servidor" });
    }
};

const getMonthlyOverallExpenseById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // req.monthlyOverallExpense es adjuntado por el middleware si existe
    res.status(200).json(req.monthlyOverallExpense);
};

const updateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idOverallMonth = parseInt(req.params.idOverallMonth, 10);
    // req.body solo debe contener campos de la cabecera: dateOverallExp, noveltyExpense, status
    // valueExpense no se actualiza directamente aquí.
    const { dateOverallExp, noveltyExpense, status } = req.body;
    const dataToUpdate = {};
    if (dateOverallExp !== undefined) dataToUpdate.dateOverallExp = dateOverallExp;
    if (noveltyExpense !== undefined) { // Mapeo si es necesario
        // Si el modelo es novelty_expense
        // dataToUpdate.novelty_expense = noveltyExpense;
        dataToUpdate.noveltyExpense = noveltyExpense; // Si el modelo es noveltyExpense
    }
    if (status !== undefined) dataToUpdate.status = status;


    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: "No se proporcionaron datos para actualizar." });
    }

    try {
        const affectedRows = await monthlyOverallExpenseService.updateMonthlyOverallExpense(idOverallMonth, dataToUpdate);

        if (affectedRows === 0) {
            // El middleware validateMonthlyOverallExpenseExistence ya se encargó del 404
            // Si existe pero no hubo cambios, devolver el registro actual.
            const existingExpense = await monthlyOverallExpenseService.getMonthlyOverallExpenseById(idOverallMonth);
            return res.status(200).json({ message: "No se realizaron cambios.", data: existingExpense });
        }

        const updatedExpense = await monthlyOverallExpenseService.getMonthlyOverallExpenseById(idOverallMonth);
        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error("Error al actualizar gasto mensual:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Error interno del servidor" });
    }
};

const deleteMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idOverallMonth = parseInt(req.params.idOverallMonth, 10);

    try {
        // El servicio ahora maneja la lógica de ítems y el 404 si no existe
        await monthlyOverallExpenseService.deleteMonthlyOverallExpense(idOverallMonth);
        res.status(204).end();
    } catch (error) {
        console.error("Error al eliminar gasto mensual:", error);
        const errorMsg = error.message || "Error interno del servidor";
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: errorMsg });
    }
};

const changeStateMonthlyOverallExpense = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idOverallMonth = parseInt(req.params.idOverallMonth, 10);
    const { status } = req.body;

    try {
        await monthlyOverallExpenseService.changeStateMonthlyOverallExpense(idOverallMonth, status);
        const updatedExpense = await monthlyOverallExpenseService.getMonthlyOverallExpenseById(idOverallMonth);
        if (!updatedExpense) { // Doble check por si acaso
             return res.status(404).json({ message: "Gasto mensual no encontrado después de cambiar estado." });
        }
        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error("Error al cambiar estado del gasto mensual:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Error interno del servidor" });
    }
};

const getTotalExpenseByMonth = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { year, month } = req.params;
        const totalExpense = await monthlyOverallExpenseService.getTotalExpenseByMonth(parseInt(year), parseInt(month));
        res.status(200).json({ year: parseInt(year), month: parseInt(month), totalExpense });
    } catch (error) {
        console.error("Error al obtener el total de gastos por mes:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Error interno del servidor" });
    }
};

// getTotalExpenseByCategoryAndMonth ya no aplica directamente a la cabecera.
// Si se requiere, se debe crear una nueva ruta/controlador/servicio que sume los items
// agrupados por su categoría (SpecificConceptSpent -> ExpenseCategory).

module.exports = {
    createMonthlyOverallExpense,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
    getTotalExpenseByMonth,
    // getTotalExpenseByCategoryAndMonth, // Comentado/Eliminado
};