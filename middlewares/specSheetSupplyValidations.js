// middlewares/specSheetSupplyValidations.js
const { body, param } = require("express-validator");
const db = require('../models');
const { SpecSheetSupply, SpecSheet, Supply } = db; // Usar Supply en lugar de Supplier
const { Op } = require('sequelize');

// Función auxiliar genérica para validar existencia de entidad
const validateEntityExistence = (Model, errorMessage, pkField = 'id') => async (value) => {
    if (value == null || isNaN(parseInt(value)) || parseInt(value) <= 0) {
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

const validateSupplyPk = (field) => body(field)
    .notEmpty().withMessage("El ID del insumo es requerido.")
    .isInt({ min: 1 }).withMessage("El ID del insumo debe ser un entero positivo.")
    .custom(validateEntityExistence(Supply, "El insumo especificado no existe.", 'idSupply')); // Usar modelo Supply

const validateSpecSheetSupplyPkParam = param('idSpecSheetSupply')
    .isInt({ min: 1 }).withMessage("El ID del insumo de ficha técnica en la URL debe ser un entero positivo.")
    .custom(validateEntityExistence(SpecSheetSupply, "El registro de insumo de ficha técnica especificado no existe.", 'idSpecSheetSupply'));

// Validación para unicidad de la combinación idSpecSheet + idSupply
const validateUniqueSpecSheetSupplyEntry = async (value, { req }) => {
    // value es el req.body en este caso
    const { idSpecSheet, idSupply } = req.body;
    const idSpecSheetSupplyToUpdate = req.params.idSpecSheetSupply;

    if (!idSpecSheet || !idSupply) {
        return true; // Dejar que las validaciones de campo individuales fallen
    }

    const whereClause = {
        idSpecSheet: parseInt(idSpecSheet),
        idSupply: parseInt(idSupply)
    };

    if (idSpecSheetSupplyToUpdate) {
        whereClause.idSpecSheetSupply = { [Op.ne]: parseInt(idSpecSheetSupplyToUpdate) };
    }

    const existingEntry = await SpecSheetSupply.findOne({ where: whereClause });
    if (existingEntry) {
        return Promise.reject("Este insumo ya ha sido añadido a esta ficha técnica.");
    }
    return true;
};

const commonFieldsValidation = [
    body("quantity")
        .notEmpty().withMessage("La cantidad del insumo es requerida.")
        .isDecimal().withMessage("La cantidad debe ser un número decimal.")
        .toFloat()
        .custom(val => val > 0).withMessage("La cantidad del insumo debe ser mayor que cero."),
    body("measurementUnit")
        .notEmpty().withMessage("La unidad de medida del insumo es requerida.")
        .isString().withMessage("La unidad de medida debe ser texto.")
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage("La unidad de medida debe tener entre 1 y 50 caracteres."),
        // .isIn(['kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'unidad', 'docena', 'cucharada', 'taza']) // Ejemplo de lista, ajústala
        // .withMessage("Unidad de medida del insumo no válida."),
    body("notes")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("Las notas deben ser texto.")
        .trim()
        .isLength({ max: 500 }).withMessage("Las notas no pueden exceder los 500 caracteres."),
];

const createSpecSheetSupplyValidation = [
    validateSpecSheetPk('idSpecSheet'),
    validateSupplyPk('idSupply'),
    ...commonFieldsValidation,
    body().custom(validateUniqueSpecSheetSupplyEntry) // Validar unicidad en la creación
];

const updateSpecSheetSupplyValidation = [
    validateSpecSheetSupplyPkParam,
    // No permitir cambiar idSpecSheet o idSupply en una actualización directa
    body("idSpecSheet").not().exists().withMessage("No se puede modificar el idSpecSheet de un insumo existente en la ficha."),
    body("idSupply").not().exists().withMessage("No se puede modificar el idSupply de un insumo existente en la ficha."),
    // Validar los campos que sí se pueden actualizar
    body("quantity")
        .optional()
        .isDecimal().withMessage("La cantidad debe ser un número decimal.")
        .toFloat()
        .custom(val => val > 0).withMessage("La cantidad del insumo debe ser mayor que cero."),
    body("measurementUnit")
        .optional()
        .isString().withMessage("La unidad de medida debe ser texto.")
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage("La unidad de medida debe tener entre 1 y 50 caracteres."),
        // .isIn(['kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'unidad', 'docena', 'cucharada', 'taza']) // Aplicar también aquí si se envía
        // .withMessage("Unidad de medida del insumo no válida."),
    body("notes")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("Las notas deben ser texto.")
        .trim()
        .isLength({ max: 500 }).withMessage("Las notas no pueden exceder los 500 caracteres."),
];

const deleteSpecSheetSupplyValidation = [
    validateSpecSheetSupplyPkParam
];

const getSpecSheetSupplyByIdValidation = [ // Nueva para el get by PK
    validateSpecSheetSupplyPkParam
];

const getSuppliesBySpecSheetValidation = [
    param("idSpecSheet")
        .isInt({ min: 1 }).withMessage("El ID de la ficha técnica en la URL debe ser un entero positivo.")
        .custom(validateEntityExistence(SpecSheet, "La ficha técnica especificada no existe.", 'idSpecSheet'))
];

const getSpecSheetsBySupplyValidation = [
    param("idSupply")
        .isInt({ min: 1 }).withMessage("El ID del insumo en la URL debe ser un entero positivo.")
        .custom(validateEntityExistence(Supply, "El insumo especificado no existe.", 'idSupply'))
];

module.exports = {
  createSpecSheetSupplyValidation,
  updateSpecSheetSupplyValidation,
  deleteSpecSheetSupplyValidation,
  getSpecSheetSupplyByIdValidation, // Añadida
  getSuppliesBySpecSheetValidation,
  getSpecSheetsBySupplyValidation,
};