// repositories/monthlyOverallExpenseRepository.js
const { Op } = require('sequelize');
const { MonthlyOverallExpense, MonthlyExpenseItem, SpecificConceptSpent, ExpenseCategory } = require('../models'); // Importar todos los modelos necesarios desde db

const createMonthlyOverallExpenseWithItems = async (overallData, itemsData, transaction) => {
    // 1. Crear la cabecera del gasto mensual
    // 'overallData' ya no debe contener idExpenseCategory
    // 'overallData' SÍ debe contener 'valueExpense' (el total)
    const newOverallExpense = await MonthlyOverallExpense.create(overallData, { transaction });

    // 2. Crear los ítems y asociarlos
    if (itemsData && itemsData.length > 0) {
        const itemsToCreate = itemsData.map(item => ({
            ...item, // Contiene idSpecificConcept, price, baseSalary, numEmployees, etc.
            idOverallMonth: newOverallExpense.idOverallMonth, // Asociar al ID de la cabecera recién creada
        }));
        await MonthlyExpenseItem.bulkCreate(itemsToCreate, { transaction });
    }
    return newOverallExpense; // Devolver la cabecera creada
};


const getAllMonthlyOverallExpenses = async (filters = {}) => {
    const whereClause = {};

    if (filters.status !== undefined) {
        whereClause.status = filters.status;
    }
    // idExpenseCategory ya no es un filtro para la cabecera
    // Si se quisiera filtrar por categorías de los ítems, la consulta sería más compleja (subqueries o joins)

    if (filters.year && filters.month) {
        const year = parseInt(filters.year);
        const monthIndex = parseInt(filters.month) - 1;
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
        whereClause.dateOverallExp = { [Op.between]: [startDate, endDate] };
    } else if (filters.year) {
        const year = parseInt(filters.year);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        whereClause.dateOverallExp = { [Op.between]: [startDate, endDate] };
    }

    return MonthlyOverallExpense.findAll({
        where: whereClause,
        include: [ // Incluir los ítems y sus detalles para una respuesta completa
            {
                model: MonthlyExpenseItem,
                as: 'expenseItems',
                include: [
                    {
                        model: SpecificConceptSpent,
                        as: 'specificConceptDetails',
                        include: [
                            {
                                model: ExpenseCategory,
                                as: 'expenseCategoryDetails',
                                attributes: ['idExpenseCategory', 'name']
                            }
                        ],
                        attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation']
                    }
                ],
                attributes: { exclude: ['createdAt', 'updatedAt'] } // Excluir timestamps de los ítems si no son necesarios
            }
        ],
        order: [['dateOverallExp', 'DESC'], ['idOverallMonth', 'DESC']]
    });
};


const getMonthlyOverallExpenseById = async (idOverallMonth) => {
    return MonthlyOverallExpense.findByPk(idOverallMonth, {
        include: [ // Incluir ítems y sus detalles
            {
                model: MonthlyExpenseItem,
                as: 'expenseItems',
                include: [
                    {
                        model: SpecificConceptSpent,
                        as: 'specificConceptDetails',
                        include: [
                            {
                                model: ExpenseCategory,
                                as: 'expenseCategoryDetails',
                                attributes: ['idExpenseCategory', 'name']
                            }
                        ],
                         attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation', 'isBimonthly']
                    }
                ],
                attributes: { exclude: ['createdAt', 'updatedAt', 'idOverallMonth'] }
            }
        ]
    });
};


const updateMonthlyOverallExpense = async (idOverallMonth, monthlyOverallExpenseData) => {
    // 'monthlyOverallExpenseData' solo debería contener campos de la cabecera
    // como dateOverallExp, noveltyExpense, status. valueExpense NO se actualiza aquí directamente.
    // Si los items cambian, valueExpense se recalcularía en el servicio o por un trigger.
    const [affectedRows] = await MonthlyOverallExpense.update(monthlyOverallExpenseData, {
        where: { idOverallMonth },
        returning: false,
    });
    return affectedRows;
};


const deleteMonthlyOverallExpense = async (idOverallMonth) => {
    // La lógica de verificar y eliminar ítems asociados se maneja mejor en el servicio con una transacción.
    return MonthlyOverallExpense.destroy({ where: { idOverallMonth } });
};

const changeStateMonthlyOverallExpense = async (idOverallMonth, status) => {
    const [affectedRows] = await MonthlyOverallExpense.update({ status }, {
        where: { idOverallMonth },
        returning: false,
    });
    return affectedRows;
};


const getTotalExpenseByMonth = async (year, month) => {
    const monthIndex = parseInt(month) - 1;
    const startDate = new Date(parseInt(year), monthIndex, 1);
    const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59, 999);

    const total = await MonthlyOverallExpense.sum('valueExpense', {
        where: {
            dateOverallExp: { [Op.between]: [startDate, endDate] },
            status: true
        },
    });
    return total || 0;
};

// getTotalExpenseByCategoryAndMonth ya no tiene sentido para la cabecera.
// Si se necesita, se debe implementar una nueva función que sume los MonthlyExpenseItem
// uniéndolos con SpecificConceptSpent y filtrando por idExpenseCategory.

module.exports = {
    createMonthlyOverallExpenseWithItems, // Cambiado
    getAllMonthlyOverallExpenses,
    getMonthlyOverallExpenseById,
    updateMonthlyOverallExpense,
    deleteMonthlyOverallExpense,
    changeStateMonthlyOverallExpense,
    getTotalExpenseByMonth,
    // getTotalExpenseByCategoryAndMonth, // Comentado/Eliminado
};