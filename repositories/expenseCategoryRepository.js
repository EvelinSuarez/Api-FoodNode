// repositories/expenseCategoryRepository.js
const ExpenseCategory = require('../models/ExpenseCategory');

const create = async (data) => {
    return ExpenseCategory.create(data);
};

const findAll = async (filters = {}) => { // Añadir capacidad de filtros básicos
    const whereClause = {};
    if (filters.status !== undefined) {
        whereClause.status = filters.status;
    }
    // Podrías añadir más filtros si es necesario, ej: por nombre
    return ExpenseCategory.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};

const findById = async (idExpenseCategory) => {
    return ExpenseCategory.findByPk(idExpenseCategory);
};

const update = async (idExpenseCategory, data) => {
    // update devuelve un array [count, rows] donde count es el número de filas afectadas.
    // Para PostgreSQL con returning: true, rows contendría los registros actualizados.
    // Para otros dialectos, necesitarías volver a buscar el registro.
    const [numberOfAffectedRows] = await ExpenseCategory.update(data, {
        where: { idExpenseCategory }
        // returning: true, // Habilitar si tu dialecto lo soporta y lo quieres
        // individualHooks: true // Si tienes hooks que deben correr en update
    });
    return numberOfAffectedRows;
};

const deleteById = async (idExpenseCategory) => {
    // destroy devuelve el número de filas eliminadas
    return ExpenseCategory.destroy({ where: { idExpenseCategory } });
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    deleteById,
};