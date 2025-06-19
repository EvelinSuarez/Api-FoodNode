// Archivo nuevo: backend/src/repositories/dashboardRepository.js

const { MonthlyExpenseItem, SpecificConceptSpent, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtiene los items de gasto para un mes/año y categoría específicos.
 * Esto es la base para el dashboard de gastos.
 */
const findExpenseItemsByFilter = async (filters = {}) => {
    const { year, month, idExpenseCategory } = filters;
    const whereClause = {};

    // ¡OJO! La tabla de Items no tiene fecha. La fecha está en el encabezado.
    // Por lo tanto, necesitamos incluir el encabezado para poder filtrar por fecha.
    const includeOptions = [
        {
            model: SpecificConceptSpent,
            as: 'specificConceptSpent', // Alias de la asociación
            required: true, // Hacemos que sea INNER JOIN
            // Filtramos aquí por la categoría del concepto
            where: idExpenseCategory ? { idExpenseCategory } : {},
        },
        // Incluimos el encabezado para poder filtrar por fecha
        {
            model: sequelize.models.MonthlyOverallExpense, // Acceso seguro al modelo
            as: 'monthlyOverallExpense',
            required: true,
            attributes: ['dateOverallExp'], // Solo necesitamos la fecha para filtrar
            where: (year && month) ? {
                [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('date_overall_exp')), year),
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('date_overall_exp')), month),
                ]
            } : {},
        }
    ];

    return MonthlyExpenseItem.findAll({
        include: includeOptions,
    });
};

module.exports = {
    findExpenseItemsByFilter,
};