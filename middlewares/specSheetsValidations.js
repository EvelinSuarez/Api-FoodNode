// middlewares/specSheetsValidations.js
const { body, param } = require("express-validator");
const db = require('../models'); // Usar db para acceder a los modelos y Sequelize.Op
const { SpecSheet, Product } = db; // Desestructurar los modelos que se usan aquí

// Validaciones auxiliares
const validateSpecSheetExistence = async (id) => {
  const specSheet = await SpecSheet.findByPk(parseInt(id)); // Asegurarse de parsear el ID
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

// Validaciones base para los campos principales de SpecSheet
const specSheetCoreFieldsValidation = [
  body("idProduct")
    .notEmpty().withMessage("El ID del producto es requerido.")
    .isInt({ min: 1 }).withMessage("El ID del producto debe ser un número entero positivo.")
    .custom(validateProductExistence),
  body("quantity")
    .notEmpty().withMessage("La cantidad base es requerida.")
    .isFloat({ gt: 0 }).withMessage("La cantidad base debe ser un número mayor que cero."),
  body("startDate")
    .notEmpty().withMessage("La fecha de inicio es requerida.")
    .isISO8601().toDate().withMessage("La fecha de inicio debe tener un formato de fecha válido (YYYY-MM-DD)."),
  body("endDate")
    .optional({ nullable: true, checkFalsy: true })
    .if(body("endDate").notEmpty()) // Solo valida si el campo tiene algún valor (no es null, undefined, o "")
    .isISO8601().toDate().withMessage("La fecha de fin debe tener un formato de fecha válido (YYYY-MM-DD) si se proporciona.")
    .custom((value, { req }) => {
        if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
            throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
        }
        return true;
    }),
  body("status")
    .optional()
    .isBoolean().withMessage("El estado debe ser un valor booleano (true o false)."),
  body("measurementUnit")
    .notEmpty().withMessage("La unidad de medida para la cantidad base es requerida.")
    .isString().withMessage("La unidad de medida debe ser un texto.")
    .isIn(['kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'gal', 'm', 'cm', 'mm', 'unidad', 'docena']) // El frontend envía estos valores
    .withMessage("Unidad de medida principal no válida. Valores permitidos: kg, g, mg, lb, oz, L, mL, gal, m, cm, mm, unidad, docena."),
];

// Validaciones para los arrays anidados (ingredients y processes)
const nestedArraysValidation = [
  body('supplies') // Renombrado 'ingredients' a 'supplies' en el frontend payload
    .optional()
    .isArray().withMessage('Los ingredientes/suministros deben ser proporcionados como un array.')
    .custom((suppliesArray) => { // Cambiar 'ingredients' a 'suppliesArray' para claridad
        if (suppliesArray && suppliesArray.length > 0) {
            const allowedUnits = ['kg', 'g', 'mg', 'lb', 'oz', 'l', 'ml', 'gal', 'm', 'cm', 'mm', 'unidad', 'docena'];
            for (let i = 0; i < suppliesArray.length; i++) {
                const supply = suppliesArray[i]; // Cambiar 'ing' a 'supply'
                // El frontend envía idSupply, quantity, measurementUnit
                if (supply.idSupply == null || isNaN(parseInt(supply.idSupply)) || parseInt(supply.idSupply) <= 0) {
                    throw new Error(`Suministro #${i+1}: idSupply es requerido y debe ser un entero positivo.`);
                }
                if (supply.quantity == null || isNaN(parseFloat(supply.quantity)) || parseFloat(supply.quantity) <= 0) {
                    throw new Error(`Suministro #${i+1}: La cantidad es requerida y debe ser un número positivo.`);
                }
                if (!supply.measurementUnit || typeof supply.measurementUnit !== 'string' || !allowedUnits.includes(supply.measurementUnit.toLowerCase())) {
                    throw new Error(`Suministro #${i+1}: Unidad de medida '${supply.measurementUnit}' no válida. Valores permitidos: ${allowedUnits.join(', ')}.`);
                }
            }
        }
        return true;
    }),
  body('processes')
    .optional()
    .isArray().withMessage('Los procesos deben ser proporcionados como un array.')
    .custom((processesArray) => {
        if (processesArray && processesArray.length > 0) {
            for (let i = 0; i < processesArray.length; i++) {
                const proc = processesArray[i];
                // --- CORRECCIÓN AQUÍ ---
                // Validar los campos que realmente se envían y están en el modelo SpecSheetProcess
                if (!proc.processNameOverride || typeof proc.processNameOverride !== 'string' || proc.processNameOverride.trim() === '') {
                    throw new Error(`Proceso #${i+1}: El nombre del proceso (override) es requerido.`);
                }
                // La descripción es opcional en el modelo SpecSheetProcess (allowNull: true),
                // pero si se envía, puedes validar su tipo o longitud.
                // Si la descripción ES obligatoria según tu lógica de negocio (a pesar del modelo), entonces:
                // if (!proc.processDescriptionOverride || typeof proc.processDescriptionOverride !== 'string' || proc.processDescriptionOverride.trim() === '') {
                //     throw new Error(`Proceso #${i+1}: La descripción del proceso (override) es requerida.`);
                // }
                if (proc.processDescriptionOverride && (typeof proc.processDescriptionOverride !== 'string' || proc.processDescriptionOverride.length > 1000)) { // Ejemplo de validación de longitud si se proporciona
                    throw new Error(`Proceso #${i+1}: La descripción del proceso (override) no puede exceder los 1000 caracteres.`);
                }

                if (proc.processOrder != null && (isNaN(parseInt(proc.processOrder)) || parseInt(proc.processOrder) < 1) ) {
                    throw new Error(`Proceso #${i+1}: El orden del proceso debe ser un entero positivo si se proporciona.`);
                }
                // Puedes añadir validación para estimatedTimeMinutes si lo implementas y envías
                // if (proc.estimatedTimeMinutes != null && (isNaN(parseInt(proc.estimatedTimeMinutes)) || parseInt(proc.estimatedTimeMinutes) < 0) ) {
                //    throw new Error(`Proceso #${i+1}: El tiempo estimado debe ser un número entero no negativo si se proporciona.`);
                // }
            }
        }
        return true;
    }),
];

// Validación completa para crear ficha técnica
const createSpecSheetValidation = [
  ...specSheetCoreFieldsValidation,
  ...nestedArraysValidation,
  // Opcional: Validación de unicidad de SpecSheet (mismo idProduct y startDate).
  // Es más robusto manejar esto en el servicio antes de la creación o con una restricción UNIQUE en la BD.
  // body().custom(async (value, { req }) => {
  //   const existing = await SpecSheet.findOne({ where: { idProduct: req.body.idProduct, startDate: req.body.startDate, status: true }});
  //   if (existing) {
  //     throw new Error('Ya existe una ficha técnica activa para este producto con la misma fecha de inicio.');
  //   }
  // }),
];

// Validación para actualizar ficha técnica
const updateSpecSheetValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de la ficha en la URL debe ser un entero positivo.").custom(validateSpecSheetExistence),
  ...specSheetCoreFieldsValidation, // Revalidar todos los campos del cuerpo
  ...nestedArraysValidation,
  // Opcional: Validación de unicidad al actualizar, excluyendo el actual.
  // body().custom(async (value, { req }) => {
  //   const existing = await SpecSheet.findOne({
  //     where: {
  //       idProduct: req.body.idProduct,
  //       startDate: req.body.startDate,
  //       status: true,
  //       idSpecSheet: { [db.Sequelize.Op.ne]: parseInt(req.params.id) } // Excluir el actual
  //     }
  //   });
  //   if (existing) {
  //     throw new Error('Ya existe otra ficha técnica activa para este producto con la misma fecha de inicio.');
  //   }
  // }),
];

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