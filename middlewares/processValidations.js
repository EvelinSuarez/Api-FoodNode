const { body, param } = require("express-validator");
const Process = require("../models/process");

// Auxiliary validations
const validateProcessExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id es inválido");
  }
  const process = await Process.findByPk(id);
  if (!process) {
    return Promise.reject("El proceso no existe");
  }
};

const validateUniqueProcessName = async (processName) => {
  const existingProcess = await Process.findOne({ where: { processName } });
  if (existingProcess) {
    return Promise.reject("Ya existe un proceso con este nombre");
  }
};

// Base validations for Process
const processBaseValidation = [
  body("processName")
    .isLength({ min: 10, max: 100 })
    .withMessage("El nombre del proceso debe tener entre 10 y 100 caracteres")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("El nombre solo puede contener letras, números y espacios"),
  body("description")
    .optional()
    .isLength({ max: 255 })
    .withMessage("La descripción no puede exceder 255 caracteres"),
  body("status")
    .default(true)
    .isBoolean()
    .withMessage("El estado debe ser un booleano")
];

// Validation for creating Process
const createProcessValidation = [
  ...processBaseValidation,
  body("processName").custom(validateUniqueProcessName)
];

// Validation for updating Process
const updateProcessValidation = [
  ...processBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessExistence),
  body("processName").custom(async (processName, { req }) => {
    const process = await Process.findOne({
      where: {
        processName,
        idProcess: { [require("sequelize").Op.ne]: req.params.id }
      }
    });
    if (process) {
      return Promise.reject("Ya existe otro proceso con este nombre");
    }
  })
];

// Validation for deleting Process
const deleteProcessValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessExistence)
];

// Validation for getting Process by ID
const getProcessByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessExistence)
];

// Validation for changing state
const changeStateValidation = [
  body("status").isBoolean().withMessage("El estado debe ser un booleano"),
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessExistence)
];

// Validation for search
const searchProcessValidation = [
  body("searchTerm")
    .isLength({ min: 1 })
    .withMessage("El término de búsqueda no puede estar vacío")
    .isLength({ max: 250 })
    .withMessage("El término de búsqueda no puede exceder 250 caracteres")
];

module.exports = {
  createProcessValidation,
  updateProcessValidation,
  deleteProcessValidation,
  getProcessByIdValidation,
  changeStateValidation,
  searchProcessValidation
};