// services/expenseCategoryService.js
const expenseCategoryRepository = require('../repositories/expenseCategoryRepository');
const SpecificConceptSpent = require('../models/SpecificConceptSpent'); // Para verificar asociaciones
const MonthlyOverallExpense = require('../models/monthlyOverallExpense'); // Para verificar asociaciones

const createExpenseCategory = async (data) => {
    // El nombre ya debería ser único debido al índice del modelo y la validación del middleware.
    // Aquí se podría normalizar data, ej: data.name = data.name.trim();
    return expenseCategoryRepository.create(data);
};

const getAllExpenseCategories = async (filters = {}) => { // Pasar filtros desde el controlador
    return expenseCategoryRepository.findAll(filters);
};

const getExpenseCategoryById = async (idExpenseCategory) => {
    const category = await expenseCategoryRepository.findById(idExpenseCategory);
    if (!category) {
        // Podrías lanzar un error aquí o dejar que el controlador maneje el 'no encontrado'
    }
    return category;
};

const updateExpenseCategory = async (idExpenseCategory, data) => {
    // El servicio de actualización devuelve el número de filas afectadas.
    // El controlador luego re-consulta para obtener el objeto actualizado.
    const { idExpenseCategory: ignoredId, ...updateData } = data; // Evitar actualizar la PK desde el body
    return expenseCategoryRepository.update(idExpenseCategory, updateData);
};

const deleteExpenseCategory = async (idExpenseCategory) => {
    // Lógica de negocio: Verificar si se puede eliminar
    // Ejemplo: no eliminar si tiene conceptos específicos o registros mensuales asociados
    // Esto depende de tu definición de la asociación muchos-a-muchos.
    // Si SpecificConceptSpent tiene una FK a ExpenseCategory (antes de la refactorización M-M),
    // o si la tabla de unión (SpecificConcept_ExpenseCategory_Links) tiene entradas para esta categoría.

    // Para la nueva estructura M-M:
    const category = await expenseCategoryRepository.findById(idExpenseCategory, {
        include: [ // Necesitarás definir estas asociaciones en tu modelo ExpenseCategory
            { model: SpecificConceptSpent, as: 'specificConcepts', limit: 1 }
        ]
    });

    if (category && category.specificConcepts && category.specificConcepts.length > 0) {
         const error = new Error('No se puede eliminar la categoría porque tiene conceptos de gasto específicos asociados.');
         error.statusCode = 409; // Conflict
         throw error;
    }

    // También verificar si hay MonthlyOverallExpense asociados (si esta FK se mantiene en MonthlyOverallExpense)
    const monthlyRecords = await MonthlyOverallExpense.findOne({ where: { idExpenseCategory: idExpenseCategory } });
    if (monthlyRecords) {
        const error = new Error('No se puede eliminar la categoría porque tiene registros de gastos mensuales generales asociados.');
        error.statusCode = 409;
        throw error;
    }

    return expenseCategoryRepository.deleteById(idExpenseCategory);
};

const changeStateExpenseCategory = async (idExpenseCategory, status) => {
    // Similar a update, el repositorio devuelve el número de filas afectadas.
    return expenseCategoryRepository.update(idExpenseCategory, { status });
};

module.exports = {
    createExpenseCategory,
    getAllExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
    changeStateExpenseCategory,
};