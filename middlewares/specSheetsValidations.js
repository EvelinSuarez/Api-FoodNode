const { body, param, validationResult } = require("express-validator");
const SpecSheet = require("../models/specSheet");
const Product = require("../models/Product");
const Supplier = require("../models/supplier");

// Validaciones auxiliares
const validateSpecSheetExistence = async (id) => {
  const specSheet = await SpecSheet.findByPk(id);
  if (!specSheet) {
    return Promise.reject("La ficha técnica no existe");
  }
};

const validateProductExistence = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    return Promise.reject("El producto no existe");
  }
};

const validateUniqueSpecSheet = async (
  idProduct,
  startDate,
  endDate = null
) => {
  const whereClause = {
    idProduct,
    startDate,
  };

  if (endDate) {
    whereClause.endDate = endDate;
  }

  const existingSpecSheet = await SpecSheet.findOne({ where: whereClause });

  if (existingSpecSheet) {
    return Promise.reject(
      "Ya existe una ficha técnica para este producto en las fechas especificadas"
    );
  }
};

const validateUniqueSuppliers = async (idProduct, suppliers) => {
  // // Asumimos que 'insumos' es un array de IDs de insumos
  const product = await Product.findByPk(idProduct, {
    include: [{ model: Supplier, as: "Supplier" }],
  });

  if (!product) {
    return Promise.reject("El producto no existe");
  }

  // Obtener todos los SpecSheets existentes para comparar
  const existingSpecSheets = await SpecSheet.findAll({
    where: { idProduct: { [require("sequelize").Op.ne]: idProduct } },
    include: [
      {
        model: Product,
        include: [{ model: Supplier, as: "Supplier" }],
      },
    ],
  });

  for (let specSheet of existingSpecSheets) {
    const existingSuppliers = specSheet.Product.Supplier.map(
      (s) => s.idSupplier
    );
    if (
      JSON.stringify(existingSuppliers.sort()) ===
      JSON.stringify(suppliers.sort())
    ) {
      return Promise.reject(
        "Ya existe una ficha técnica con los mismos insumos para otro producto"
      );
    }
  }
};

// Validaciones base para fichas técnicas
const specSheetBaseValidation = [
  body("idProduct")
    .isInt({ min: 1 })
    .withMessage("El ID del producto debe ser un número entero positivo")
    .custom(validateProductExistence),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser un número entero positivo"),
  body("startDate")
    .isISO8601()
    .withMessage("La fecha de inicio debe ser una fecha válida"),
    //no puede aver una fecha de inicio menor a la fecha actual
    body("startDate").custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error("La fecha de inicio no puede ser menor a la fecha actual");
      }
      return true
    }),
  //no puede ser una fecha superior a la fecha actual
  body("endDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha válida"),
    
  body("status")
    .default(true)
    .isBoolean()
    .withMessage("El estado debe ser un booleano"),
  body("measurementUnit")
    .isString()
    .withMessage("La unidad de medida debe ser un texto")
    .matches(
      /^(kg|g|mg|lb|oz|L|mL|gal|m|cm|mm|unidad|docena|gramos|kilogramos|miligramos|libras|onzas|litros|mililitros|galones|metros|centimetros|milimetros|unidades|docenas)$/i
    )
    .withMessage(
      "La unidad de medida debe ser válida: kg, g, mg, lb, oz, L, mL, gal, m, cm, mm, unidad, docena, gramos, kilogramos, miligramos, libras, onzas, litros, mililitros, galones, metros, centímetros, milímetros, unidades, docenas."
    ),
  body("quantity")
    .isInt()
    .withMessage("La cantidad debe ser un texto")
    .isLength({ min: 1, max: 30 })
    .withMessage("La cantidad debe tener entre 1 y 30 caracteres"),
];

// Validación para crear ficha técnica
const createSpecSheetValidation = [
  ...specSheetBaseValidation,
  body("endDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(
      "Si se proporciona, la fecha de fin debe ser una fecha válida"
    ),
  body().custom(async (value, { req }) => {
    await validateUniqueSpecSheet(
      req.body.idProduct,
      req.body.startDate,
      req.body.endDate || null
    );
  }),
];

// Validación para actualizar ficha técnica
const updateSpecSheetValidation = [
  ...specSheetBaseValidation,
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSpecSheetExistence),
  body().custom(async (value, { req }) => {
    const specSheet = await SpecSheet.findByPk(req.params.id);
    if (
      specSheet.idProduct !== req.body.idProduct ||
      specSheet.startDate.toISOString() !==
        new Date(req.body.startDate).toISOString() ||
      specSheet.endDate.toISOString() !==
        new Date(req.body.endDate).toISOString()
    ) {
      await validateUniqueSpecSheet(
        req.body.idProduct,
        req.body.startDate,
        req.body.endDate
      );
    }
  }),
];

// Validación para eliminar ficha técnica
const deleteSpecSheetValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSpecSheetExistence),
];

// Validación para obtener ficha técnica por ID
const getSpecSheetByIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSpecSheetExistence),
];

// Validación para cambiar estado
const changeStateValidation = [
  body("status").isBoolean().withMessage("El estado debe ser un booleano"),
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateSpecSheetExistence),
];

// Validación para búsqueda
const searchSpecSheetValidation = [
  body("searchTerm")
    .isLength({ min: 1 })
    .withMessage("El término de búsqueda no puede estar vacío")
    .isLength({ max: 250 })
    .withMessage("El término de búsqueda no puede exceder 250 caracteres"),
];

// Validación para obtener fichas técnicas por producto
const getSpecSheetsByProductValidation = [
  param("idProduct")
    .isInt()
    .withMessage("El ID del producto debe ser un número entero")
    .custom(async (idProduct) => {
      // Primero verificar si el producto existe
      const product = await Product.findByPk(idProduct);
      if (!product) {
        throw new Error("El producto no existe");
      }

      // Luego verificar si tiene fichas técnicas
      const specSheet = await SpecSheet.findOne({
        where: { idProduct },
      });

      if (!specSheet) {
        throw new Error("No existen fichas técnicas para este producto");
      }
      return true;
    }),
];

module.exports = {
  createSpecSheetValidation,
  updateSpecSheetValidation,
  deleteSpecSheetValidation,
  getSpecSheetByIdValidation,
  changeStateValidation,
  searchSpecSheetValidation,
  getSpecSheetsByProductValidation,
};
