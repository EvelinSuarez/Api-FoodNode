const { body, param } = require("express-validator");
const db = require('../models'); // Para acceder a los modelos
const { SpecSheet, SpecSheetProcess, Process } = db; // Asegúrate de importar Process (modelo maestro)
const { Op } = require('sequelize');

// Función auxiliar genérica para validar existencia de entidad
const validateEntityExistence = (Model, errorMessage, pkField = 'id') => async (value, { req }) => {
    if (value == null || isNaN(parseInt(value)) || parseInt(value) <= 0) {
        // Si es opcional y no se envía, no rechazar. La cadena de validación se encargará (ej .optional())
        if (value === undefined || value === null) return true;
        return Promise.reject(`El ID debe ser un entero positivo.`);
    }
    const entity = await Model.findByPk(parseInt(value));
    if (!entity) {
        return Promise.reject(errorMessage);
    }
    return true;
};

const validateSpecSheetPk = (field) => body(field)
    .notEmpty().withMessage("El ID de la ficha técnica es requerido.")
    .isInt({ min: 1 }).withMessage("El ID de la ficha técnica debe ser un entero positivo.")
    .custom(validateEntityExistence(SpecSheet, "La ficha técnica especificada no existe.", 'idSpecSheet'));

const validateProcessMasterPk = (field) => body(field)
    .notEmpty().withMessage("El ID del proceso maestro es requerido.")
    .isInt({ min: 1 }).withMessage("El ID del proceso maestro debe ser un entero positivo.")
    .custom(validateEntityExistence(Process, "El proceso maestro especificado no existe.", 'idProcess')); // Asume que Process es el modelo maestro

const validateSpecSheetProcessPkParam = param('idSpecSheetProcess')
    .isInt({ min: 1 }).withMessage("El ID del proceso de ficha técnica en la URL debe ser un entero positivo.")
    .custom(validateEntityExistence(SpecSheetProcess, "El proceso de la ficha técnica especificado no existe.", 'idSpecSheetProcess'));

// Validación para el orden del proceso (único por ficha técnica)
const validateUniqueProcessOrder = async (processOrder, { req }) => {
    const idSpecSheetParam = req.params.idSpecSheet; // Para GET /specsheet/:idSpecSheet/processes
    const idSpecSheetBody = req.body.idSpecSheet;
    const idSpecSheetProcessToUpdate = req.params.idSpecSheetProcess;

    let targetIdSpecSheet;

    if (idSpecSheetProcessToUpdate) { // Es una actualización
        const ssp = await SpecSheetProcess.findByPk(idSpecSheetProcessToUpdate);
        if (!ssp) return true; // La validación de existencia del ssp se encargará
        targetIdSpecSheet = ssp.idSpecSheet;
    } else if (idSpecSheetBody) { // Es una creación
        targetIdSpecSheet = idSpecSheetBody;
    } else {
        return true; // No hay idSpecSheet para validar, otra validación fallará primero
    }
    
    if (!targetIdSpecSheet || isNaN(parseInt(targetIdSpecSheet))) {
        return Promise.reject("ID de ficha técnica no válido para validar orden de proceso.");
    }

    const whereClause = {
        idSpecSheet: parseInt(targetIdSpecSheet),
        processOrder: parseInt(processOrder)
    };

    if (idSpecSheetProcessToUpdate) {
        whereClause.idSpecSheetProcess = { [Op.ne]: parseInt(idSpecSheetProcessToUpdate) };
    }

    const existingProcess = await SpecSheetProcess.findOne({ where: whereClause });
    if (existingProcess) {
        return Promise.reject(`El orden del proceso '${processOrder}' ya existe para esta ficha técnica.`);
    }
    return true;
};


const commonFieldsValidation = [
    body("processOrder")
        .notEmpty().withMessage("El orden del proceso es requerido.")
        .isInt({ min: 1 }).withMessage("El orden del proceso debe ser un entero positivo.")
        .custom(validateUniqueProcessOrder),
    body("processNameOverride")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("El nombre personalizado del proceso debe ser texto.")
        .trim()
        .isLength({ min: 2, max: 150 }).withMessage("El nombre personalizado del proceso debe tener entre 2 y 150 caracteres."),
    body("processDescriptionOverride")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("La descripción personalizada del proceso debe ser texto.")
        .trim()
        .isLength({ min: 5 }).withMessage("La descripción personalizada del proceso debe tener al menos 5 caracteres."),
    body("estimatedTimeMinutes")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0 }).withMessage("El tiempo estimado debe ser un número entero no negativo (minutos).")
        .toInt()
];

const createSpecSheetProcessValidation = [
    validateSpecSheetPk('idSpecSheet'),
    validateProcessMasterPk('idProcess'), // FK al proceso maestro
    ...commonFieldsValidation,
];

const updateSpecSheetProcessValidation = [
    validateSpecSheetProcessPkParam,
    // No permitir cambiar idSpecSheet ni idProcess en una actualización
    body("idSpecSheet").not().exists().withMessage("No se puede modificar el idSpecSheet de un proceso existente."),
    body("idProcess").not().exists().withMessage("No se puede modificar el idProcess (maestro) de un proceso existente."),
    // Campos actualizables (hacerlos opcionales)
    body("processOrder")
        .optional()
        .isInt({ min: 1 }).withMessage("El orden del proceso debe ser un entero positivo.")
        .custom(validateUniqueProcessOrder),
    body("processNameOverride") // Re-aplicar validaciones si se envía
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("El nombre personalizado del proceso debe ser texto.")
        .trim()
        .isLength({ min: 2, max: 150 }).withMessage("El nombre personalizado del proceso debe tener entre 2 y 150 caracteres."),
    body("processDescriptionOverride")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("La descripción personalizada del proceso debe ser texto.")
        .trim()
        .isLength({ min: 5 }).withMessage("La descripción personalizada del proceso debe tener al menos 5 caracteres."),
    body("estimatedTimeMinutes")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0 }).withMessage("El tiempo estimado debe ser un número entero no negativo (minutos).")
        .toInt()
];

const getSpecSheetProcessByIdValidation = [
    validateSpecSheetProcessPkParam,
];

const deleteSpecSheetProcessValidation = [
    validateSpecSheetProcessPkParam,
];

const getAllProcessesBySpecSheetValidation = [
    param("idSpecSheet")
        .isInt({min: 1}).withMessage("El ID de la ficha técnica en la URL debe ser un entero positivo.")
        .custom(validateEntityExistence(SpecSheet, "La ficha técnica especificada no existe.", 'idSpecSheet')),
];


module.exports = {
  createSpecSheetProcessValidation,
  updateSpecSheetProcessValidation,
  getSpecSheetProcessByIdValidation,
  deleteSpecSheetProcessValidation,
  getAllProcessesBySpecSheetValidation,
};