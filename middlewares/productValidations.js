// Archivo: middlewares/productValidations.js
// --- VERSIÓN COMPLETA CON LA NUEVA VALIDACIÓN PARA AJUSTE DE VENTA ---

const { body, param, validationResult } = require("express-validator");
// Corregido: El modelo se llama 'Supply', no 'supply' en el define
const { Product, Supply } = require("../models"); 

// Validaciones auxiliares
const validateProductExistence = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    return Promise.reject("El producto no existe");
  }
};

const validateUniqueProductName = async (productName) => {
  const existingProduct = await Product.findOne({ where: { productName } });
  if (existingProduct) {
    return Promise.reject("El producto ya existe");
  }
};

const validateSupplierExists = async (idSupplier) => {
  // Corregido: El modelo es 'Supply'
  const supplier = await Supply.findByPk(idSupplier);
  if (!supplier) {
    return Promise.reject("El insumo/proveedor seleccionado no existe");
  }
};

// Validaciones base para productos
const productBaseValidation = [
  body("productName")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre del producto debe tener entre 3 y 100 caracteres"),
  
  body("minStock")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("El stock mínimo debe ser un número entero no negativo."),

  body("maxStock")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("El stock máximo debe ser un número entero no negativo.")
    .custom((maxStock, { req }) => {
        const minStock = parseInt(req.body.minStock, 10);
        const maxStockParsed = parseInt(maxStock, 10);
        if (!isNaN(minStock) && !isNaN(maxStockParsed)) {
            if (maxStockParsed > 0 && maxStockParsed < minStock) { // Solo si maxStock es > 0
                throw new Error("El stock máximo no puede ser menor que el stock mínimo.");
            }
        }
        return true;
    }),

  body("status")
    .default(true)
    .isBoolean()
    .withMessage("El estado debe ser un booleano"),
];

// Validación para crear producto
const createProductValidation = [
  ...productBaseValidation,
  body("productName").custom(validateUniqueProductName),
];

// Validación para ajuste de stock de INSUMOS
const adjustStockValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID del producto es inválido.").custom(validateProductExistence),
  body("quantity").isFloat({ gt: 0 }).withMessage("La cantidad debe ser un número positivo."),
  body("type").isIn(['entrada', 'salida']).withMessage("El tipo de ajuste debe ser 'entrada' o 'salida'."),
  body("reason").trim().notEmpty().withMessage("Se requiere un motivo para el ajuste.")
];

// --- NUEVA VALIDACIÓN PARA AJUSTE DE STOCK DE VENTA ---
const adjustSaleStockValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('Se requiere un ID de producto válido en la URL.')
        .custom(validateProductExistence),
    body('quantitySold')
        .notEmpty().withMessage('La cantidad vendida es requerida.')
        .isFloat({ gt: 0 }).withMessage('La cantidad vendida debe ser un número positivo.'),
    body('reason')
        .optional()
        .isString().withMessage('El motivo debe ser un texto.')
        .trim()
];

// Validación para actualizar producto
const updateProductValidation = [
  ...productBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo.").custom(validateProductExistence),
  body("productName").custom(async (productName, { req }) => {
    const product = await Product.findOne({
      where: {
        productName,
        idProduct: { [require("sequelize").Op.ne]: req.params.id },
      },
    });
    if (product) {
      return Promise.reject("Ya existe otro producto con este nombre");
    }
  }),
];

// Validación para eliminar producto
const deleteProductValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo.").custom(validateProductExistence),
];

// Validación para obtener producto por ID
const getProductByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo.").custom(validateProductExistence),
];

// Validación para cambiar estado
const changeStateValidation = [
  // Corregido: el campo que se envía en el body es 'status'
  body("status").isBoolean().withMessage("El estado debe ser un booleano (true/false)."), 
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo.").custom(validateProductExistence),
];

// Validación para búsqueda
const searchProductValidation = [
  body("searchTerm")
    .isLength({ min: 1, max: 250 })
    .withMessage("El término de búsqueda debe tener entre 1 y 250 caracteres."),
];

// Validación para obtener productos por proveedor
const getProductsBySupplierValidation = [
  param("idSupplier").isInt({ min: 1 }).withMessage("El id del proveedor debe ser un número entero positivo.").custom(validateSupplierExists),
];
 
module.exports = {
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductByIdValidation,
  changeStateValidation,
  searchProductValidation,
  getProductsBySupplierValidation,
  adjustStockValidation,
  adjustSaleStockValidation // <-- Añadido a la exportación
};