const { body, param } = require("express-validator");
const ProductSheet = require("../models/productSheet");
const SpecSheet = require("../models/specSheet");
const Supplier = require("../models/supplier");

// Auxiliary validations
const validateProductSheetExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id es inválido");
  }
  const productSheet = await ProductSheet.findByPk(id);
  if (!productSheet) {
    return Promise.reject("La relación producto-ficha no existe");
  }
};

const validateSpecSheetExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id de la ficha técnica es inválido");
  }
  const specSheet = await SpecSheet.findByPk(id);
  if (!specSheet) {
    return Promise.reject("La ficha técnica no existe");
  }
};

const validateSupplierExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id del insumo es inválido");
  }
  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    return Promise.reject("El insumo no existe");
  }
};

const validateUniqueProductSheet = async (idSpecSheet, idSupplier) => {
  const existingProductSheet = await ProductSheet.findOne({
    where: { 
      idSpecSheet,
      idSupplier
    }
  });
  if (existingProductSheet) {
    return Promise.reject("Ya existe una relación entre esta ficha técnica y este insumo");
  }
};

// Base validations for ProductSheet
const productSheetBaseValidation = [
  body("idSpecSheet")
    .isInt({ min: 1 })
    .withMessage("El ID de la ficha técnica debe ser un número entero positivo")
    .custom(validateSpecSheetExistence),
  body("idSupplier")
    .isInt({ min: 1 })
    .withMessage("El ID del insumo debe ser un número entero positivo")
    .custom(validateSupplierExistence),
];

// Validation for creating ProductSheet
const createProductSheetValidation = [
  ...productSheetBaseValidation,
  body().custom(async (value) => {
    await validateUniqueProductSheet(value.idSpecSheet, value.idSupplier);
  })
];

// Validation for updating ProductSheet
const updateProductSheetValidation = [
  ...productSheetBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductSheetExistence),
  body().custom(async (value, { req }) => {
    const productSheet = await ProductSheet.findByPk(req.params.id);
    if (productSheet.idSpecSheet !== value.idSpecSheet || 
        productSheet.idSupplier !== value.idSupplier) {
      await validateUniqueProductSheet(value.idSpecSheet, value.idSupplier);
    }
  })
];

// Validation for deleting ProductSheet
const deleteProductSheetValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductSheetExistence)
];

// Validation for getting ProductSheet by ID
const getProductSheetByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductSheetExistence)
];

// Validation for getting ProductSheets by SpecSheet
const getProductSheetsBySpecSheetValidation = [
  param("idSpecSheet").isInt({ min: 1 }).withMessage("El id de la ficha técnica debe ser un número entero positivo"),
  param("idSpecSheet").custom(validateSpecSheetExistence)
];

// Validation for getting ProductSheets by Supplier
const getProductSheetsBySupplierValidation = [
  param("idSupplier").isInt({ min: 1 }).withMessage("El id del insumo debe ser un número entero positivo"),
  param("idSupplier").custom(validateSupplierExistence)
];

module.exports = {
  createProductSheetValidation,
  updateProductSheetValidation,
  deleteProductSheetValidation,
  getProductSheetByIdValidation,
  getProductSheetsBySpecSheetValidation,
  getProductSheetsBySupplierValidation
};