const { body, param, validationResult } = require("express-validator")
const Supplier = require("../models/supplier")
const ProductSheet = require("../models/productSheet")

// Validaciones auxiliares
const validateSupplierExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id es inválido");
  }
  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    return Promise.reject("El insumo no existe");
  }
};


const validateUniqueSupplierName = async (supplierName) => {
  const existingSupplier = await Supplier.findOne({ where: { supplierName } })
  if (existingSupplier) {
    return Promise.reject("El insumo ya existe")
  }
}



// Validaciones base para insumos
const supplierBaseValidation = [
  body("supplierName")
    .isLength({ min: 3 })
    .withMessage("El nombre del insumo debe tener al menos 3 caracteres")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("El nombre solo puede contener letras, números y espacios"),
    body("measurementUnit")
    .isString()
    .withMessage("La unidad de medida debe ser un texto")
    .matches(/^(kg|g|mg|lb|oz|L|mL|gal|m|cm|mm|unidad|docena|gramos|kilogramos|miligramos|libras|onzas|litros|mililitros|galones|metros|centimetros|milimetros|unidades|docenas)$/i)
.withMessage("La unidad de medida debe ser válida: kg, g, mg, lb, oz, L, mL, gal, m, cm, mm, unidad, docena, gramos, kilogramos, miligramos, libras, onzas, litros, mililitros, galones, metros, centímetros, milímetros, unidades, docenas."),
  body("status").default(true).isBoolean().withMessage("El estado debe ser un booleano"),
]

// Validación para crear insumo
const createSupplierValidation = [...supplierBaseValidation, body("supplierName").custom(validateUniqueSupplierName)]

// Validación para actualizar insumo
const updateSupplierValidation = [
  ...supplierBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSupplierExistence),
  body("supplierName").custom(async (supplierName, { req }) => {
    const supplier = await Supplier.findOne({
      where: {
        supplierName,
        idSupplier: { [require("sequelize").Op.ne]: req.params.id },
      },
    })

    if (supplier) {
      return Promise.reject("Ya existe otro insumo con este nombre")
    }
  }),
]

// Validación para eliminar insumo
const deleteSupplierValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSupplierExistence),
]

// Validación para obtener insumo por ID
const getSupplierByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSupplierExistence),
]

// Validación para cambiar estado
const changeStateValidation = [
  body("status").isBoolean().withMessage("El estado debe ser un booleano"),
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSupplierExistence),
]

// Validación para búsqueda
const searchSupplierValidation = [
  body("searchTerm")
    .isLength({ min: 1 })
    .withMessage("El término de búsqueda no puede estar vacío")
    .isLength({ max: 250 })
    .withMessage("El término de búsqueda no puede exceder 250 caracteres"),
]

module.exports = {
  createSupplierValidation,
  updateSupplierValidation,
  deleteSupplierValidation,
  getSupplierByIdValidation,
  changeStateValidation,
  searchSupplierValidation,
}