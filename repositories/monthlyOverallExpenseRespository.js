'use strict';
const { Op } = require('sequelize');
// Importamos los modelos desde el archivo index centralizado para asegurar que todas las asociaciones estén cargadas.
const { MonthlyOverallExpense, MonthlyExpenseItem, SpecificConceptSpent, ExpenseCategory } = require('../models');

// Función para crear la cabecera del gasto y sus ítems en una transacción.
const createMonthlyOverallExpenseWithItems = async (overallData, itemsData, transaction) => {
    // Crea la cabecera del gasto.
    const newOverallExpense = await MonthlyOverallExpense.create(overallData, { transaction });
    
    // Si hay ítems, los prepara y los crea en lote.
    if (itemsData && itemsData.length > 0) {
        const itemsToCreate = itemsData.map(item => ({
            ...item,
            idOverallMonth: newOverallExpense.idOverallMonth, // Asocia cada ítem con la cabecera recién creada.
        }));
        await MonthlyExpenseItem.bulkCreate(itemsToCreate, { transaction });
    }
    
    // Devuelve la cabecera creada.
    return newOverallExpense;
};

// Función para obtener todos los registros de gastos mensuales con filtros.
const getAllMonthlyOverallExpenses = async (filters = {}) => {
    const whereClause = {};
    if (filters.status !== undefined) {
        whereClause.status = filters.status;
    }
    if (filters.year && filters.month) {
        const year = parseInt(filters.year);
        const monthIndex = parseInt(filters.month) - 1;
        const startDate = new Date(Date.UTC(year, monthIndex, 1));
        const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
        whereClause.dateOverallExp = { [Op.between]: [startDate, endDate] };
    } else if (filters.year) {
        const year = parseInt(filters.year);
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
        whereClause.dateOverallExp = { [Op.between]: [startDate, endDate] };
    }

    // --- CONSULTA CORREGIDA ---
    // El 'return' ya estaba, lo cual es bueno. Los cambios están en los 'include'.
    return MonthlyOverallExpense.findAll({
        where: whereClause,
        include: [
            {
                model: MonthlyExpenseItem,
                as: 'expenseItems',
                // Excluimos los campos de auditoría y la FK redundante.
                attributes: { 
                    exclude: ['createdAt', 'updatedAt', 'idOverallMonth', 'idSpecificConcept'] 
                },
                include: [
                    {
                        model: SpecificConceptSpent,
                        as: 'specificConceptSpent',
                        // Seleccionamos solo los atributos necesarios del concepto.
                        attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation'],
                        include: [
                            {
                                model: ExpenseCategory,
                                as: 'expenseCategory',
                                // Seleccionamos solo los atributos necesarios de la categoría.
                                attributes: ['idExpenseCategory', 'name']
                            }
                        ]
                    }
                ]
            }
        ],
        order: [['dateOverallExp', 'DESC'], ['idOverallMonth', 'DESC']]
    });
    // SE ELIMINÓ LA LLAVE '}' EXTRA QUE CAUSABA ERROR DE SINTAXIS.
};

// Función para obtener un único gasto mensual por su ID.
const getMonthlyOverallExpenseById = async (idOverallMonth) => {
    return MonthlyOverallExpense.findByPk(idOverallMonth, {
        include: [
            {
                model: MonthlyExpenseItem,
                as: 'expenseItems',
                 attributes: { 
                    exclude: ['createdAt', 'updatedAt', 'idOverallMonth', 'idSpecificConcept'] 
                },
                include: [
                    {
                        model: SpecificConceptSpent,
                        as: 'specificConceptSpent',
                        attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation', 'isBimonthly'],
                        include: [
                            {
                                model: ExpenseCategory,
                                as: 'expenseCategory',
                                attributes: ['idExpenseCategory', 'name']
                            }
                        ]
                    }
                ]
            }
        ]
    });
};

// Función para actualizar la cabecera de un gasto mensual.
const updateMonthlyOverallExpense = async (idOverallMonth, monthlyOverallExpenseData) => {
    const [affectedRows] = await MonthlyOverallExpense.update(monthlyOverallExpenseData, {
        where: { idOverallMonth },
        returning: false, // No es necesario en MySQL, optimiza la consulta.
    });
    return affectedRows;
};

// Función para eliminar un registro de gasto mensual (y sus ítems por 'onDelete: CASCADE').
const deleteMonthlyOverallExpense = async (idOverallMonth) => {
    return MonthlyOverallExpense.destroy({
        where: { idOverallMonth }
    });
};

// Función para cambiar el estado (activo/inactivo) de un gasto mensual.
const changeStateMonthlyOverallExpense = async (idOverallMonth, status) => {
    const [affectedRows] = await MonthlyOverallExpense.update({ status }, {
        where: { idOverallMonth },
        returning: false,
    });
    return affectedRows;
};

// Función para obtener la suma total de gastos para un mes y año específicos.
const getTotalExpenseByMonth = async (year, month) => {
    const monthIndex = parseInt(month) - 1;
    const startDate = new Date(Date.UTC(parseInt(year), monthIndex, 1));
    const endDate = new Date(Date.UTC(parseInt(year), monthIndex + 1, 0, 23, 59, 59, 999));

    const total = await MonthlyOverallExpense.sum('valueExpense', {
        where: {
            dateOverallExp: { [Op.between]: [startDate, endDate] },
            status: true
        },
    });
    return total || 0; // Devuelve 0 si no hay resultados.
};

// Exportamos todas las funciones para que el servicio pueda usarlas.
module.exports = {
    createMonthlyOverallExpenseWithItems,
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
    getTotalExpenseByMonth,
};