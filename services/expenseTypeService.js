// services/expenseTypeService.js
const expenseTypeRepository = require('../repositories/expenseTypeRepository'); // Renombrado

const createExpenseType = async (data) => {
    return expenseTypeRepository.create(data);
};

const getAllExpenseTypes = async () => {
    return expenseTypeRepository.findAll();
};

const getExpenseTypeById = async (id) => {
    return expenseTypeRepository.findById(id);
};

const updateExpenseType = async (id, data) => {
    // Asegurarse de que no se intente cambiar el idExpenseType directamente
    const { idExpenseType, ...updateData } = data;
    return expenseTypeRepository.update(id, updateData);
};

const deleteExpenseType = async (id) => {
    // Aquí podrías añadir lógica de negocio, como verificar si se puede eliminar.
    return expenseTypeRepository.deleteById(id);
};

const changeStateExpenseType = async (id, status) => {
    return expenseTypeRepository.update(id, { status });
};

module.exports = {
    createExpenseType,
    getAllExpenseTypes,
    getExpenseTypeById,
    updateExpenseType,
    deleteExpenseType,
    changeStateExpenseType,
};