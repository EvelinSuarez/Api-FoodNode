const { body, param, validationResult } = require("express-validator")
const Product = require("../models/product")
const Supplier = require("../models/supply")

// Validaciones auxiliares
const validateProductExistence = async (id) => {
  const product = await Product.findByPk(id)
  if (!product) {
    return Promise.reject("El producto no existe")
  }
}


const validateUniqueProductName = async (productName) => {
  const existingProduct = await Product.findOne({ where: { productName } })
  if (existingProduct) {
    return Promise.reject("El producto ya existe")
  }
}

const validateSupplierExists = async (idSupplier) => {
  const supplier = await Supplier.findByPk(idSupplier)
  if (!supplier) {
    return Promise.reject("El insumo seleccionado no existe")
  }
}

// Validaciones base para productos
const productBaseValidation = [
  body("productName")
    .isLength({ min: 3 })
    .withMessage("El nombre del producto debe tener al menos 3 caracteres"),
  body("status")
    .default(true)
    .isBoolean()
    .withMessage("El estado debe ser un booleano"),
  
]

// Validación para crear producto
const createProductValidation = [
  ...productBaseValidation,
  body("productName").custom(validateUniqueProductName)
    .isLength({ min: 3, max: 30})
    .withMessage("El nombre del producto debe tener al menos 3 caracteres")
]

// Validación para actualizar producto
const updateProductValidation = [
  ...productBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductExistence),
  body("productName").custom(async (productName, { req }) => {
    const product = await Product.findOne({
      where: {
        productName,
        idProduct: { [require("sequelize").Op.ne]: req.params.id },
      },
    })

    if (product) {
      return Promise.reject("Ya existe otro producto con este nombre")
    }
  }),
]

// Validación para eliminar producto
const deleteProductValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductExistence),
]

// Validación para obtener producto por ID
const getProductByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductExistence),
]

// Validación para cambiar estado
const changeStateValidation = [
  body("status").isBoolean().withMessage("El estado debe ser un booleano"),
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProductExistence),
]

// Validación para búsqueda
const searchProductValidation = [
  body("searchTerm")
    .isLength({ min: 1 })
    .withMessage("El término de búsqueda no puede estar vacío")
    .isLength({ max: 250 })
    .withMessage("El término de búsqueda no puede exceder 250 caracteres"),
]

// Validación para obtener productos por proveedor
 const getProductsBySupplierValidation = [
  param("idSupplier").isInt({ min: 1 }).withMessage("El id del insumo debe ser un número entero positivo"),
  param("idSupplier").custom(validateSupplierExists),
]
 
module.exports = {
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductByIdValidation,
  changeStateValidation,
  searchProductValidation,
  getProductsBySupplierValidation 
}