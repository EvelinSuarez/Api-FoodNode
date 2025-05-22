// services/monthlyOverallExpenseService.js
const sequelize = require('../config/database'); // Para transacciones
const monthlyOverallExpenseRepository = require('../repositories/monthlyOverallExpenseRespository');
const MonthlyExpenseItem = require('../models/monthlyExpenseItem');
// ExpenseCategory ya no se necesita para validar la cabecera aquí

const createMonthlyOverallExpense = async (data) => {
    const { expenseItems, ...overallData } = data; // Separar datos de cabecera e ítems
    // 'overallData' ya no tiene idExpenseCategory, pero SÍ tiene 'valueExpense' del frontend

    if (!expenseItems || expenseItems.length === 0) {
        const error = new Error('Se requiere al menos un ítem de gasto para crear el registro mensual.');
        error.statusCode = 400;
        throw error;
    }
    // La validación de los campos de 'overallData' y 'expenseItems' la hace el middleware

    let transaction;
    try {
        transaction = await sequelize.transaction();
        // Pasar overallData y expenseItems al repositorio para creación conjunta
        const newOverallExpense = await monthlyOverallExpenseRepository.createMonthlyOverallExpenseWithItems(
            overallData,
            expenseItems,
            transaction
        );
        await transaction.commit();
        // Devolver el gasto completo con sus ítems (el repositorio de getById ya lo incluye)
        return monthlyOverallExpenseRepository.getMonthlyOverallExpenseById(newOverallExpense.idOverallMonth);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error en servicio createMonthlyOverallExpense:", error);
        // Podrías añadir manejo de errores más específicos si el repositorio los lanza
        throw error;
    }
};

const getAllMonthlyOverallExpenses = async (filters = {}) => {
    return monthlyOverallExpenseRepository.getAllMonthlyOverallExpenses(filters);
};

const getMonthlyOverallExpenseById = async (idOverallMonth) => {
    const expense = await monthlyOverallExpenseRepository.getMonthlyOverallExpenseById(idOverallMonth);
    if (!expense) {
        const error = new Error('Gasto mensual no encontrado.');
        error.statusCode = 404;
        throw error;
    }
    return expense;
};

const updateMonthlyOverallExpense = async (idOverallMonth, data) => {
    // 'data' solo debería contener campos de la cabecera (dateOverallExp, noveltyExpense, status)
    // valueExpense no se actualiza directamente aquí.
    // El middleware ya valida la existencia del registro.

    // Opcional: Verificar que no se intente pasar 'idExpenseCategory' o 'expenseItems'
    if (data.hasOwnProperty('idExpenseCategory') || data.hasOwnProperty('expenseItems')) {
        const error = new Error('La actualización de la categoría general o los ítems no se realiza por esta vía.');
        error.statusCode = 400;
        throw error;
    }

    const affectedRows = await monthlyOverallExpenseRepository.updateMonthlyOverallExpense(idOverallMonth, data);
    return affectedRows; // El controlador se encarga de devolver el objeto actualizado
};

const deleteMonthlyOverallExpense = async (idOverallMonth) => {
    // El middleware ya valida la existencia.
    // Necesitamos una transacción para eliminar ítems y luego la cabecera.
    let transaction;
    try {
        transaction = await sequelize.transaction();
        // 1. Eliminar todos los MonthlyExpenseItems asociados
        await MonthlyExpenseItem.destroy({
            where: { idOverallMonth },
            transaction
        });
        // 2. Eliminar la cabecera MonthlyOverallExpense
        const affectedRows = await monthlyOverallExpenseRepository.deleteMonthlyOverallExpense(idOverallMonth, { transaction });
        await transaction.commit();
        return affectedRows;
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error en servicio deleteMonthlyOverallExpense:", error);
        throw error;
    }
};

const changeStateMonthlyOverallExpense = async (idOverallMonth, status) => {
    // El middleware ya valida existencia y que status sea booleano.
    return monthlyOverallExpenseRepository.changeStateMonthlyOverallExpense(idOverallMonth, status);
};

const getTotalExpenseByMonth = async (year, month) => {
    return monthlyOverallExpenseRepository.getTotalExpenseByMonth(year, month);
};

// getTotalExpenseByCategoryAndMonth para la cabecera ya no aplica.

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