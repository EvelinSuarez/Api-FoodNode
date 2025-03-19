const { body, param } = require("express-validator");
const Process = require("../models/process");
const SpecSheet = require("../models/specSheet");
const ProcessDetail = require("../models/processDetail");

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

const validateSpecSheetExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id de la ficha técnica es inválido");
  }
  const specSheet = await SpecSheet.findByPk(id);
  if (!specSheet) {
    return Promise.reject("La ficha técnica no existe");
  }
};

const validateProcessDetailExistence = async (id) => {
  if (!id) {
    return Promise.reject("El id del detalle de proceso es inválido");
  }
  const processDetail = await ProcessDetail.findByPk(id);
  if (!processDetail) {
    return Promise.reject("El detalle de proceso no existe");
  }
};

const validateUniqueProcess = async (idSpecSheet, idProcessDetail) => {
  const existingProcess = await Process.findOne({
    where: { 
      idSpecSheet,
      idProcessDetail
    }
  });
  if (existingProcess) {
    return Promise.reject("Ya existe una relación entre esta ficha técnica y este detalle de proceso");
  }
};

// Base validations for Process
const processBaseValidation = [
  body("idSpecSheet")
    .isInt({ min: 1 })
    .withMessage("El ID de la ficha técnica debe ser un número entero positivo")
    .custom(validateSpecSheetExistence),
  body("idProcessDetail")
    .isInt({ min: 1 })
    .withMessage("El ID del detalle de proceso debe ser un número entero positivo")
    .custom(validateProcessDetailExistence)
];

// Validation for creating Process
const createProcessValidation = [
  ...processBaseValidation,
  body().custom(async (value) => {
    await validateUniqueProcess(value.idSpecSheet, value.idProcessDetail);
  })
];

// Validation for updating Process
const updateProcessValidation = [
  ...processBaseValidation,
  param("id").isInt({ min: 1 }).withMessage("El id debe ser un número entero positivo"),
  param("id").custom(validateProcessExistence),
  body().custom(async (value, { req }) => {
    const process = await Process.findByPk(req.params.id);
    if (process.idSpecSheet !== value.idSpecSheet || 
        process.idProcessDetail !== value.idProcessDetail) {
      await validateUniqueProcess(value.idSpecSheet, value.idProcessDetail);
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

// Validation for getting Processes by SpecSheet
const getProcessesBySpecSheetValidation = [
  param("idSpecSheet").isInt({ min: 1 }).withMessage("El id de la ficha técnica debe ser un número entero positivo"),
  param("idSpecSheet").custom(validateSpecSheetExistence)
];

// Validation for getting Processes by ProcessDetail
const getProcessesByProcessDetailValidation = [
  param("idProcessDetail").isInt({ min: 1 }).withMessage("El id del detalle de proceso debe ser un número entero positivo"),
  param("idProcessDetail").custom(validateProcessDetailExistence)
];

module.exports = {
  createProcessValidation,
  updateProcessValidation,
  deleteProcessValidation,
  getProcessByIdValidation,
  getProcessesBySpecSheetValidation,
  getProcessesByProcessDetailValidation
};