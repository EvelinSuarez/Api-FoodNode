// middlewares/supplyValidations.js
const { body, param } = require("express-validator");
const { Supply, SpecSheetSupply, PurchaseDetail } = require("../models"); // Importar Supply y otros modelos relacionados si es necesario
const { Op } = require('sequelize'); // Importar Op si no está ya

// Validación auxiliar para verificar la existencia de Supply
const validateSupplyExistence = async (idSupply) => {
  const id = parseInt(idSupply);
  if (isNaN(id) || id <= 0) {
    return Promise.reject("El ID del insumo debe ser un entero positivo.");
  }
  const supply = await Supply.findByPk(id);
  if (!supply) {
    return Promise.reject("El insumo especificado no existe.");
  }
  return true; // Es importante retornar true en éxito para custom validators
};

// Validación para nombre único del insumo
const validateUniqueSupplyName = async (supplyName, { req }) => {
  const whereClause = { supplyName };
  if (req.params && req.params.idSupply) { // Si es una actualización, excluir el insumo actual
    whereClause.idSupply = { [Op.ne]: parseInt(req.params.idSupply) };
  }
  const existingSupply = await Supply.findOne({ where: whereClause });
  if (existingSupply) {
    return Promise.reject("Ya existe un insumo con este nombre.");
  }
  return true;
};

const commonSupplyFieldsValidation = [
  body("supplyName")
    .notEmpty().withMessage("El nombre del insumo es requerido.")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("El nombre del insumo debe tener entre 2 y 100 caracteres.")
    // .matches(/^[a-zA-Z0-9\sÀ-ÖØ-öø-ÿ_.'-]+$/).withMessage("El nombre del insumo contiene caracteres no válidos."), // Regex más permisiva
    .custom(validateUniqueSupplyName), // Validar unicidad en creación y actualización
  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage("La descripción debe ser texto.")
    .trim()
    .isLength({ max: 500 }).withMessage("La descripción no puede exceder los 500 caracteres."),
  body("unitOfMeasure")
    .notEmpty().withMessage("La unidad de medida es requerida.")
    .isString().withMessage("La unidad de medida debe ser texto.")
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage("La unidad de medida debe tener entre 1 y 50 caracteres."),
    // Podrías tener una lista de unidades permitidas, pero hacerla flexible con isString es más simple inicialmente
    // .isIn(['kg', 'g', 'L', 'mL', 'unidad', 'pieza', 'metro', 'caja']) // Ejemplo
    // .withMessage("Unidad de medida no válida."),
  body("status")
    .optional() // Para creación se puede omitir y tomar el defaultValue. Para actualización, es opcional.
    .isBoolean().withMessage("El estado debe ser un valor booleano (true/false).")
    .toBoolean(), // Asegura que se convierta a booleano
  // Validaciones para campos opcionales si los añades (currentStock, minStockLevel, idCategory)
  // body("currentStock").optional().isDecimal().toFloat().custom(v => v >= 0),
  // body("minStockLevel").optional({nullable: true}).isDecimal().toFloat().custom(v => v >= 0),
  // body("idCategory").optional({nullable: true}).isInt({min:1}).custom(validateCategoryExistence) // Necesitarías validateCategoryExistence
];

const createSupplyValidation = [
  ...commonSupplyFieldsValidation.filter(validation => !validation.custom || validation.custom.name !== 'validateUniqueSupplyName'), // Removemos el custom de common
  body("supplyName").custom((value, {req}) => validateUniqueSupplyName(value, {req})), // Lo aplicamos específicamente para creación
  // Asegurar que los campos opcionales en commonSupplyFieldsValidation se manejen bien si son obligatorios aquí
];

const updateSupplyValidation = [
  param("idSupply") // PK del insumo a actualizar
    .isInt({ min: 1 }).withMessage("El ID del insumo en la URL debe ser un entero positivo.")
    .custom(validateSupplyExistence),
  ...commonSupplyFieldsValidation.filter(validation => !validation.custom || validation.custom.name !== 'validateUniqueSupplyName'),
  body("supplyName").optional().custom((value, {req}) => validateUniqueSupplyName(value, {req})), // Si se envía supplyName, validar unicidad
  // No permitir cambiar idSupply
  body("idSupply").not().exists().withMessage("No se puede modificar el ID del insumo."),
];

const getSupplyByIdValidation = [
  param("idSupply")
    .isInt({ min: 1 }).withMessage("El ID del insumo debe ser un entero positivo.")
    .custom(validateSupplyExistence),
];

// Para delete, se podría verificar si el insumo está en uso.
const deleteSupplyValidation = [
  param("idSupply")
    .isInt({ min: 1 }).withMessage("El ID del insumo debe ser un entero positivo.")
    .custom(async (idSupply, { req }) => {
        await validateSupplyExistence(idSupply); // Primero verifica que exista
        // Verificar si está en uso en SpecSheetSupplies
        const isInSpecSheet = await SpecSheetSupply.findOne({ where: { idSupply } });
        if (isInSpecSheet) {
            return Promise.reject("El insumo no se puede eliminar porque está siendo utilizado en fichas técnicas.");
        }
        // Verificar si está en uso en PurchaseDetails
        const isInPurchase = await PurchaseDetail.findOne({ where: { idSupply } });
        if (isInPurchase) {
            return Promise.reject("El insumo no se puede eliminar porque tiene registros de compras asociadas.");
        }
        // Podrías añadir más verificaciones (ej. ProductionOrderSupply si lo usas directamente)
        return true;
    }),
];

const changeSupplyStatusValidation = [
  param("idSupply")
    .isInt({ min: 1 }).withMessage("El ID del insumo debe ser un entero positivo.")
    .custom(validateSupplyExistence),
  body("status")
    .exists().withMessage("El nuevo estado (status) es requerido.")
    .isBoolean().withMessage("El estado debe ser un valor booleano (true/false).")
    .toBoolean(),
];

module.exports = {
  createSupplyValidation,
  updateSupplyValidation,
  getSupplyByIdValidation,
  deleteSupplyValidation,
  changeSupplyStatusValidation,
};