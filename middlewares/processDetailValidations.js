const { body, param } = require("express-validator");
const ProcessDetail = require("../models/processDetail");
const Process = require("../models/process");
const SpecSheet = require("../models/specSheet");
const Employee = require("../models/employee");

// Auxiliary validations
const validateProcessDetailExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id es inválido");
  }
  const processDetail = await ProcessDetail.findByPk(id);
  if (!processDetail) {
    return Promise.reject("El detalle de proceso no existe");
  }
};

const validateProcessExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id del proceso es inválido");
  }
  const process = await Process.findByPk(id);
  if (!process) {
    return Promise.reject("El proceso no existe");
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

const validateEmployeeExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id del empleado es inválido");
  }
  const employee = await Employee.findByPk(id);
  if (!employee) {
    return Promise.reject("El empleado no existe");
  }
};

const validateDates = (startDate, endDate) => {
  if (endDate && new Date(startDate) >= new Date(endDate)) {
    throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
  }
  return true;
};

// Base validations for ProcessDetail
const processDetailBaseValidation = [
  body("idProcess")
    .isInt({ min: 1 })
    .withMessage("El ID del proceso debe ser un número entero positivo")
    .custom(validateProcessExistence),
  body("idSpecSheet")
    .isInt({ min: 1 })
    .withMessage("El ID de la ficha técnica debe ser un número entero positivo")
    .custom(validateSpecSheetExistence),
  body("idEmployee")
    .isInt({ min: 1 })
    .withMessage("El ID del empleado debe ser un número entero positivo")
    .custom(validateEmployeeExistence),
  body("startDate")
    .isISO8601()
    .withMessage("La fecha de inicio debe ser una fecha válida"),
  body("endDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha válida"),
  body("status")
    .default(true)
    .isBoolean()
    .withMessage("El estado debe ser un booleano"),
  body().custom((value) => {
    if (value.endDate) {
      return validateDates(value.startDate, value.endDate);
    }
    return true;
  })
];

// Validation for creating ProcessDetail
const createProcessDetailValidation = [
  ...processDetailBaseValidation
];

// Validation for updating ProcessDetail
const updateProcessDetailValidation = [
  ...processDetailBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessDetailExistence)
];

// Validation for deleting ProcessDetail
const deleteProcessDetailValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessDetailExistence)
];

// Validation for getting ProcessDetail by ID
const getProcessDetailByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessDetailExistence)
];

// Validation for changing state
const changeStateValidation = [
  body("status").isBoolean().withMessage("El estado debe ser un booleano"),
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessDetailExistence)
];

// Validation for getting ProcessDetails by Process
const getProcessDetailsByProcessValidation = [
  param("idProcess").isInt({ min: 1 }).withMessage("El id del proceso debe ser un número entero positivo"),
  param("idProcess").custom(validateProcessExistence)
];

// Validation for getting ProcessDetails by SpecSheet
const getProcessDetailsBySpecSheetValidation = [
  param("idSpecSheet").isInt({ min: 1 }).withMessage("El id de la ficha técnica debe ser un número entero positivo"),
  param("idSpecSheet").custom(validateSpecSheetExistence)
];

// Validation for getting ProcessDetails by Employee
const getProcessDetailsByEmployeeValidation = [
  param("idEmployee").isInt({ min: 1 }).withMessage("El id del empleado debe ser un número entero positivo"),
  param("idEmployee").custom(validateEmployeeExistence)
];

module.exports = {
  createProcessDetailValidation,
  updateProcessDetailValidation,
  deleteProcessDetailValidation,
  getProcessDetailByIdValidation,
  changeStateValidation,
  getProcessDetailsByProcessValidation,
  getProcessDetailsBySpecSheetValidation,
  getProcessDetailsByEmployeeValidation
};