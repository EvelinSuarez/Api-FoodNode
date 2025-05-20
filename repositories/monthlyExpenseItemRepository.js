// repositories/monthlyExpenseItemRepository.js
const MonthlyExpenseItem = require('../models/MonthlyExpenseItem');
const SpecificConceptSpent = require('../models/SpecificConceptSpent'); // Para includes si es necesario al leer items
const { Op } = require('sequelize');

/**
 * Crea múltiples ítems de gasto mensual en bloque.
 * @param {Array<Object>} items - Un array de objetos, cada uno representando un MonthlyExpenseItem.
 * @param {Object} [options={}] - Opciones de Sequelize (ej. { transaction }).
 * @returns {Promise<Array<MonthlyExpenseItem>>} - Promesa que resuelve a un array de los ítems creados.
 */
const bulkCreate = async (items, options = {}) => {
    return MonthlyExpenseItem.bulkCreate(items, options);
};

/**
 * Encuentra todos los ítems de gasto mensual asociados a un idOverallMonth.
 * @param {number} idOverallMonth - El ID del MonthlyOverallExpense padre.
 * @param {Object} [options={}] - Opciones de Sequelize (ej. { transaction }).
 * @returns {Promise<Array<MonthlyExpenseItem>>} - Promesa que resuelve a un array de ítems.
 */
const findAllByOverallMonthId = async (idOverallMonth, options = {}) => {
    return MonthlyExpenseItem.findAll({
        where: { idOverallMonth },
        include: [
            {
                model: SpecificConceptSpent, // Asumiendo que tu modelo de item tiene la relación
                as: 'concept',      // Asegúrate que el alias 'concept' esté definido en MonthlyExpenseItem.belongsTo(SpecificConceptSpent)
                attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation']
            }
        ],
        order: [['idMonthlyExpenseItem', 'ASC']], // O el orden que prefieras
        ...options
    });
};

/**
 * Encuentra un ítem de gasto mensual específico por su PK.
 * @param {number} idMonthlyExpenseItem - El ID del ítem.
 * @param {Object} [options={}] - Opciones de Sequelize.
 * @returns {Promise<MonthlyExpenseItem|null>}
 */
const findById = async (idMonthlyExpenseItem, options = {}) => {
    return MonthlyExpenseItem.findByPk(idMonthlyExpenseItem, {
        include: [
            {
                model: SpecificConceptSpent,
                as: 'concept',
                attributes: ['idSpecificConcept', 'name', 'requiresEmployeeCalculation']
            }
        ],
        ...options
    });
};


/**
 * Actualiza un ítem de gasto mensual específico.
 * @param {number} idMonthlyExpenseItem - El ID del ítem a actualizar.
 * @param {number} idOverallMonth - El ID del MonthlyOverallExpense padre (para seguridad).
 * @param {Object} dataToUpdate - Los campos a actualizar en el ítem.
 * @param {Object} [options={}] - Opciones de Sequelize (ej. { transaction }).
 * @returns {Promise<Array<number>>} - Promesa que resuelve al número de filas afectadas.
 */
const updateByIdAndOverallMonthId = async (idMonthlyExpenseItem, idOverallMonth, dataToUpdate, options = {}) => {
    return MonthlyExpenseItem.update(dataToUpdate, {
        where: {
            idMonthlyExpenseItem,
            idOverallMonth
        },
        ...options
    });
};

/**
 * Elimina todos los ítems de gasto mensual asociados a un idOverallMonth.
 * Útil cuando se elimina el MonthlyOverallExpense padre y no hay ON DELETE CASCADE.
 * @param {number} idOverallMonth - El ID del MonthlyOverallExpense padre.
 * @param {Object} [options={}] - Opciones de Sequelize (ej. { transaction }).
 * @returns {Promise<number>} - Promesa que resuelve al número de ítems eliminados.
 */
const deleteByOverallMonthId = async (idOverallMonth, options = {}) => {
    return MonthlyExpenseItem.destroy({
        where: { idOverallMonth },
        ...options
    });
};

/**
 * Elimina un ítem de gasto mensual específico por su PK.
 * @param {number} idMonthlyExpenseItem - El ID del ítem a eliminar.
 * @param {Object} [options={}] - Opciones de Sequelize.
 * @returns {Promise<number>} - Número de filas eliminadas.
 */
const deleteById = async (idMonthlyExpenseItem, options = {}) => {
    return MonthlyExpenseItem.destroy({
        where: { idMonthlyExpenseItem },
        ...options
    });
};


module.exports = {
    bulkCreate,
    findAllByOverallMonthId,
    findById,
    updateByIdAndOverallMonthId, // Para la actualización de un ítem específico
    deleteByOverallMonthId,
    deleteById, // Si necesitas borrar un ítem individual directamente
};