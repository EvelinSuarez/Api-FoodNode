// Archivo: middlewares/specSheetsValidations.js
const { body, param } = require("express-validator");
const db = require('../models');
const { SpecSheet, Product } = db;

// --- Funciones auxiliares (sin cambios, ya estaban bien) ---
const validateSpecSheetExistence = async (id) => {
  const specSheet = await SpecSheet.findByPk(parseInt(id));
  if (!specSheet) {
    return Promise.reject("La ficha técnica especificada no existe.");
  }
};
const validateProductExistence = async (idProduct) => {
  const id = parseInt(idProduct);
  if (isNaN(id) || id <= 0) {
    return Promise.reject("El ID del producto debe ser un entero positivo.");
  }
  const product = await Product.findByPk(id);
  if (!product) {
    return Promise.reject("El producto especificado no existe.");
  }
  if (!product.status) {
    return Promise.reject("El producto especificado no está activo.");
  }
};

// --- Validaciones base para los campos principales (AQUÍ ESTÁN LOS CAMBIOS) ---
const specSheetCoreFieldsValidation = [
  body("idProduct")
    .notEmpty().withMessage("El ID del producto es requerido.")
    .isInt({ min: 1 }).withMessage("El ID del producto debe ser un número entero positivo.")
    .custom(validateProductExistence),
  
  // --- CAMBIO AQUÍ: de 'quantity' a 'quantityBase' ---
  body("quantityBase")
    .notEmpty().withMessage("El peso final es requerido.")
    .isFloat({ gt: 0 }).withMessage("El peso final debe ser un número mayor que cero."),
    
  // --- CAMBIO AQUÍ: de 'startDate' a 'dateEffective' ---
  body("dateEffective")
    .notEmpty().withMessage("La fecha efectiva es requerida.")
    .isISO8601().toDate().withMessage("La fecha efectiva debe tener un formato de fecha válido (YYYY-MM-DD)."),
    
  // --- CAMBIO AQUÍ: Añadir validación para 'portions' ---
  body("portions")
    .notEmpty().withMessage("El número de porciones es requerido.")
    .isInt({ gt: 0 }).withMessage("Las porciones deben ser un número entero mayor que cero."),

  body("endDate")
    .optional({ nullable: true, checkFalsy: true })
    .if(body("endDate").notEmpty())
    .isISO8601().toDate().withMessage("La fecha de fin debe tener un formato de fecha válido (YYYY-MM-DD) si se proporciona.")
    .custom((value, { req }) => {
        // --- CAMBIO AQUÍ: usar 'dateEffective' en la comparación ---
        if (value && req.body.dateEffective && new Date(value) < new Date(req.body.dateEffective)) {
            throw new Error('La fecha de fin no puede ser anterior a la fecha efectiva.');
        }
        return true;
    }),
  body("status")
    .optional()
    .isBoolean().withMessage("El estado debe ser un valor booleano (true o false)."),
  body("unitOfMeasure")
    .notEmpty().withMessage("La unidad de medida es requerida.")
    .isString().withMessage("La unidad de medida debe ser un texto.")
    .isIn(['kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'gal', 'm', 'cm', 'mm', 'unidad', 'docena'])
    .withMessage("Unidad de medida principal no válida."),
];

// --- Validaciones para los arrays anidados (sin cambios mayores, pero revisemos nombres) ---
const nestedArraysValidation = [
  // --- CAMBIO AQUÍ: 'supplies' a 'specSheetSupplies' para coincidir con payload ---
  body('specSheetSupplies') 
    .optional()
    .isArray().withMessage('Los ingredientes deben ser un arreglo.')
    .custom((suppliesArray) => {
        if (suppliesArray && suppliesArray.length > 0) {
            // ... tu lógica de validación interna está bien ...
        }
        return true;
    }),
  // --- CAMBIO AQUÍ: 'processes' a 'specSheetProcesses' para coincidir con payload ---
  body('specSheetProcesses')
    .optional()
    .isArray().withMessage('Los procesos deben ser un arreglo.')
    .custom((processesArray) => {
        if (processesArray && processesArray.length > 0) {
            // ... tu lógica de validación interna está bien ...
        }
        return true;
    }),
];


// --- Composición de validaciones (sin cambios) ---
const createSpecSheetValidation = [
  ...specSheetCoreFieldsValidation,
  ...nestedArraysValidation,
];

const updateSpecSheetValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la ficha en la URL debe ser un entero positivo.").custom(validateSpecSheetExistence),
  ...specSheetCoreFieldsValidation,
  ...nestedArraysValidation,
];

// --- Resto del archivo (sin cambios) ---
const deleteSpecSheetValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la ficha en la URL debe ser un entero positivo.").custom(validateSpecSheetExistence),
];
const getSpecSheetByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la ficha en la URL debe ser un entero positivo.").custom(validateSpecSheetExistence),
];
const changeSpecSheetStatusValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la ficha en la URL debe ser un entero positivo.").custom(validateSpecSheetExistence),
  body("status").exists({ checkFalsy: false }).withMessage("El campo 'status' es requerido.")
                 .isBoolean().withMessage("El estado debe ser un valor booleano (true o false)."),
];
const getSpecSheetsByProductValidation = [
  param("idProduct")
    .isInt({ min: 1 }).withMessage("El ID del producto en la URL debe ser un entero positivo.")
    .custom(validateProductExistence),
];

module.exports = {
  createSpecSheetValidation,
  updateSpecSheetValidation,
  deleteSpecSheetValidation,
  getSpecSheetByIdValidation,
  changeSpecSheetStatusValidation,
  getSpecSheetsByProductValidation,
};