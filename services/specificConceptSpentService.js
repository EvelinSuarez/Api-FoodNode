// services/specificConceptSpentService.js
// const sequelize = require('../config/database'); // No se necesita transacción para operaciones simples de 1-M
const specificConceptSpentRepository = require('../repositories/specificConceptSpentRepository');
// ExpenseCategory ya no se necesita aquí para verificación si la validación lo hace
const MonthlyExpenseItem = require('../models/monthlyExpenseItem');

const createSpecificConceptSpent = async (data) => {
    // 'data' ya viene con idExpenseCategory validado por el middleware.
    // La validación de unicidad (nombre + idExpenseCategory) también es manejada por el middleware y la BD.
    try {
        // La validación de existencia de idExpenseCategory la hace el middleware.
        const newConcept = await specificConceptSpentRepository.create(data);
        // Devolver el concepto con sus asociaciones (la categoría)
        return specificConceptSpentRepository.findByIdWithDetails(newConcept.idSpecificConcept);
    } catch (error) {
        console.error("Error en servicio createSpecificConceptSpent:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            // El error de la BD 'uq_concept_name_in_category' lo confirma
            throw new Error('Ya existe un concepto de gasto específico con este nombre dentro de la categoría seleccionada.');
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('La categoría de gasto especificada (idExpenseCategory) no existe.');
        }
        throw error; // Relanzar otros errores
    }
};

const getAllSpecificConceptSpents = async (filters = {}) => {
    console.log('[SERVICE scs] Filters recibidos del controlador:', JSON.stringify(filters));
    return specificConceptSpentRepository.findAllWithOptions(filters);
};

const getSpecificConceptSpentById = async (idSpecificConcept) => {
    const concept = await specificConceptSpentRepository.findByIdWithDetails(idSpecificConcept);
    // El controlador se encarga del 404 si no se encuentra, basado en la validación
    return concept;
};

const updateSpecificConceptSpent = async (idSpecificConcept, data) => {
    // La validación de existencia del concepto y de idExpenseCategory (si se provee) la hace el middleware.
    // La validación de unicidad del nombre (si se cambia) también.

    // Se necesita el concepto actual para verificar si hubo cambios reales si las filas afectadas son 0
    const conceptToUpdate = await specificConceptSpentRepository.findByIdWithDetails(idSpecificConcept);
    if (!conceptToUpdate) { // Doble verificación, aunque el middleware debería cubrirlo
        const error = new Error('Concepto de gasto específico no encontrado para actualizar.');
        error.statusCode = 404;
        throw error;
    }

    try {
        const affectedRows = await specificConceptSpentRepository.update(idSpecificConcept, data);

        if (affectedRows === 0) {
            // Verificar si los datos enviados son realmente diferentes a los existentes
            let changed = false;
            for (const key in data) {
                if (data.hasOwnProperty(key) && String(conceptToUpdate[key]) !== String(data[key])) {
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                return { updated: false, concept: await specificConceptSpentRepository.findByIdWithDetails(idSpecificConcept) };
            }
            // Si affectedRows es 0 pero los datos eran diferentes, podría ser un problema.
            // Sin embargo, la BD debería haber lanzado un error de unicidad si aplicaba.
            // Podría ser que el hook beforeUpdate no se disparó o algo similar.
            // Por ahora, si affectedRows es 0 y los datos eran diferentes, es un caso raro.
            // Devolvemos el concepto como si no se hubiera actualizado, confiando en que la BD hubiera lanzado error de unicidad.
        }
        
        return { updated: true, concept: await specificConceptSpentRepository.findByIdWithDetails(idSpecificConcept) };

    } catch (error) {
        console.error("Error en servicio updateSpecificConceptSpent:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('Ya existe otro concepto de gasto específico con este nombre dentro de la categoría seleccionada.');
        }
        if (error.name === 'SequelizeForeignKeyConstraintError' && data.idExpenseCategory) {
             throw new Error('La nueva categoría de gasto especificada (idExpenseCategory) no existe.');
        }
        throw error;
    }
};

const deleteSpecificConceptSpent = async (idSpecificConcept) => {
    // La validación de existencia ya la hace el middleware.

    // Verificar si está en uso en MonthlyExpenseItem
    const isInUse = await MonthlyExpenseItem.findOne({ where: { idSpecificConcept: idSpecificConcept } });
    if (isInUse) {
        const error = new Error('No se puede eliminar el concepto porque está siendo usado en registros de gastos mensuales detallados.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    // No se necesita transacción para un delete simple sin tablas de unión
    try {
        const affectedRows = await specificConceptSpentRepository.deleteById(idSpecificConcept);
        return affectedRows; // El controlador maneja el 404 si es 0
    } catch (error) {
        console.error("Error en servicio deleteSpecificConceptSpent:", error);
        throw error;
    }
};

const changeStateSpecificConceptSpent = async (idSpecificConcept, status) => {
    // La validación de existencia ya se hace en el middleware.
    // El repositorio devuelve el número de filas afectadas.
    return specificConceptSpentRepository.update(idSpecificConcept, { status });
};

module.exports = {
    createSpecificConceptSpent,
    getAllSpecificConceptSpents,
    getSpecificConceptSpentById,
    updateSpecificConceptSpent,
    deleteSpecificConceptSpent,
    changeStateSpecificConceptSpent,
};