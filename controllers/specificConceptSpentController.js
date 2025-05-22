// controllers/specificConceptSpentController.js
const { validationResult } = require('express-validator');
const specificConceptSpentService = require('../services/specificConceptSpentService'); // Asegúrate que la ruta sea correcta

const createSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const concept = await specificConceptSpentService.createSpecificConceptSpent(req.body);
        res.status(201).json(concept);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este concepto de gasto ya existe para el tipo de gasto general seleccionado.' });
        }
        if (error.message && error.message.includes('El tipo de gasto general (idExpenseType) no existe')) {
             return res.status(400).json({ message: error.message });
        }
        console.error("Error en createSpecificConceptSpent:", error);
        res.status(500).json({ message: error.message || "Error creando el concepto de gasto específico." });
    }
};

const getAllSpecificConceptSpents = async (req, res) => {
    const errors = validationResult(req); // Asumiendo que tienes validaciones para GET (opcional)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { idExpenseType, status, requiresEmployeeCalculation } = req.query;
        const filters = {};

        console.log('[CONTROLLER - specificConceptSpentController] req.query:', JSON.stringify(req.query));
        console.log('[CONTROLLER - specificConceptSpentController] req.query.status (valor crudo):', status, '(tipo:', typeof status + ')');
        console.log('[CONTROLLER - specificConceptSpentController] req.query.requiresEmployeeCalculation (valor crudo):', requiresEmployeeCalculation, '(tipo:', typeof requiresEmployeeCalculation + ')');


        if (idExpenseType) {
            const parsedId = parseInt(idExpenseType, 10);
            if (!isNaN(parsedId)) {
                filters.idExpenseType = parsedId;
            } else {
                console.warn(`[CONTROLLER] idExpenseType '${idExpenseType}' no es un número válido.`);
                // Podrías retornar un error 400 si es inválido
            }
        }

        // --- LÓGICA CORREGIDA PARA 'status' ---
        if (status !== undefined) {
            if (typeof status === 'string') {
                const lowerStatus = status.toLowerCase();
                if (lowerStatus === 'true' || lowerStatus === '1') {
                    filters.status = true;
                } else if (lowerStatus === 'false' || lowerStatus === '0') {
                    filters.status = false;
                }
                // Si es un string pero no 'true', 'false', '1', '0', se podría ignorar o tratar como error
            } else if (typeof status === 'boolean') {
                filters.status = status; // Si ya es booleano, úsalo directamente
            }
            console.log('[CONTROLLER - specificConceptSpentController] filters.status ASIGNADO:', filters.status, '(tipo:', typeof filters.status + ')');
        }
        // --- FIN LÓGICA CORREGIDA PARA 'status' ---

        // --- LÓGICA SIMILAR PARA 'requiresEmployeeCalculation' ---
        if (requiresEmployeeCalculation !== undefined) {
            if (typeof requiresEmployeeCalculation === 'string') {
                const lowerReqCalc = requiresEmployeeCalculation.toLowerCase();
                if (lowerReqCalc === 'true' || lowerReqCalc === '1') {
                    filters.requiresEmployeeCalculation = true;
                } else if (lowerReqCalc === 'false' || lowerReqCalc === '0') {
                    filters.requiresEmployeeCalculation = false;
                }
            } else if (typeof requiresEmployeeCalculation === 'boolean') {
                filters.requiresEmployeeCalculation = requiresEmployeeCalculation;
            }
            console.log('[CONTROLLER - specificConceptSpentController] filters.requiresEmployeeCalculation ASIGNADO:', filters.requiresEmployeeCalculation, '(tipo:', typeof filters.requiresEmployeeCalculation + ')');
        }
        // --- FIN LÓGICA PARA 'requiresEmployeeCalculation' ---

        console.log('[CONTROLLER - specificConceptSpentController] Filters construidos ANTES de llamar al servicio:', JSON.stringify(filters));

        const concepts = await specificConceptSpentService.getAllSpecificConceptSpents(filters);
        res.status(200).json(concepts);
    } catch (error) {
        console.error("Error en getAllSpecificConceptSpents:", error);
        res.status(500).json({ message: error.message || "Error obteniendo los conceptos de gasto específicos." });
    }
};

const getSpecificConceptSpentById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);

    if (isNaN(idSpecificConcept)) {
        return res.status(400).json({ message: 'El ID del concepto específico debe ser un número.' });
    }

    try {
        const concept = await specificConceptSpentService.getSpecificConceptSpentById(idSpecificConcept);
        if (!concept) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        res.status(200).json(concept);
    } catch (error) {
        console.error("Error en getSpecificConceptSpentById:", error);
        res.status(500).json({ message: error.message || "Error obteniendo el concepto de gasto específico." });
    }
};

const updateSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);

    if (isNaN(idSpecificConcept)) {
        return res.status(400).json({ message: 'El ID del concepto específico debe ser un número.' });
    }

    try {
        // No pasar el idSpecificConcept del cuerpo si está presente, usar el de params
        const { idSpecificConcept: _, ...updateData } = req.body;

        const [updatedCount] = await specificConceptSpentService.updateSpecificConceptSpent(idSpecificConcept, updateData);

        if (updatedCount === 0) {
            const exists = await specificConceptSpentService.getSpecificConceptSpentById(idSpecificConcept);
            if (!exists) {
                return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
            }
            // Si existe pero no se actualizó, podría ser porque los datos eran iguales o por otra razón
            // Devolver el objeto existente puede ser útil para el frontend
            return res.status(200).json({ message: 'Concepto no modificado (datos iguales o no se encontró para actualizar).', data: exists });
        }
        const updatedConcept = await specificConceptSpentService.getSpecificConceptSpentById(idSpecificConcept);
        res.status(200).json(updatedConcept);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este concepto de gasto ya existe para el tipo de gasto general seleccionado.' });
        }
        if (error.message && error.message.includes('El nuevo tipo de gasto general (idExpenseType) proporcionado no existe')) {
             return res.status(400).json({ message: error.message });
        }
        console.error("Error en updateSpecificConceptSpent:", error);
        res.status(500).json({ message: error.message || "Error actualizando el concepto de gasto específico." });
    }
};

const deleteSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);

    if (isNaN(idSpecificConcept)) {
        return res.status(400).json({ message: 'El ID del concepto específico debe ser un número.' });
    }

    try {
        const result = await specificConceptSpentService.deleteSpecificConceptSpent(idSpecificConcept);
        if (result === 0) { // `destroy` devuelve el número de filas eliminadas
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        res.status(204).end(); // No content, éxito
    } catch (error) {
         if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ message: 'No se puede eliminar el concepto porque está siendo usado en registros de gastos mensuales.' });
        }
        console.error("Error en deleteSpecificConceptSpent:", error);
        res.status(500).json({ message: error.message || "Error eliminando el concepto de gasto específico." });
    }
};

const changeStateSpecificConceptSpent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const idSpecificConcept = parseInt(req.params.idSpecificConcept, 10);
    const { status } = req.body; // El estado viene del cuerpo para PATCH/PUT

    if (isNaN(idSpecificConcept)) {
        return res.status(400).json({ message: 'El ID del concepto específico debe ser un número.' });
    }
    if (typeof status !== 'boolean') {
        return res.status(400).json({ message: 'El estado debe ser un valor booleano (true o false).' });
    }

    try {
        const [updatedCount] = await specificConceptSpentService.changeStateSpecificConceptSpent(idSpecificConcept, status);
        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Concepto de gasto específico no encontrado.' });
        }
        const updatedConcept = await specificConceptSpentService.getSpecificConceptSpentById(idSpecificConcept);
        res.status(200).json(updatedConcept);
    } catch (error) {
        console.error("Error en changeStateSpecificConceptSpent:", error);
        res.status(500).json({ message: error.message || "Error cambiando el estado del concepto de gasto específico." });
    }
};

module.exports = {
    createSpecificConceptSpent,
    getAllSpecificConceptSpents,
    getSpecificConceptSpentById,
    updateSpecificConceptSpent,
    deleteSpecificConceptSpent,
    changeStateSpecificConceptSpent,
};