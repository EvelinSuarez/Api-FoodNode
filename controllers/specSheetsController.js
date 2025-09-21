// Archivo: controllers/specSheetsController.js
// VERSIÓN CORREGIDA Y REFACTORIZADA

const { validationResult } = require("express-validator");
const specSheetService = require("../services/specSheetsService");
// <<<--- YA NO NECESITAMOS IMPORTAR LOS MODELOS AQUÍ --- >>>

const handleControllerError = (res, error, operation) => {
    console.error(`Controlador[${operation}]:`, error.message);
    if (error.name === 'NotFoundError') {
        return res.status(404).json({ message: error.message });
    }
    if (error.name === 'BadRequestError' || error.name.startsWith('Sequelize')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: `Error interno en ${operation}.`, details: error.message });
};

const createSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Errores de validación.", errors: errors.array() });
  }
  try {
    const newSpecSheet = await specSheetService.createSpecSheet(req.body);
    res.status(201).json({ message: "Ficha técnica creada exitosamente.", specSheet: newSpecSheet });
  } catch (error) {
    handleControllerError(res, error, "createSpecSheet");
  }
};

const getAllSpecSheets = async (req, res) => {
  try {
    const specSheets = await specSheetService.getAllSpecSheets();
    res.status(200).json(specSheets);
  } catch (error) {
    handleControllerError(res, error, "getAllSpecSheets");
  }
};

const getSpecSheetById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const specSheet = await specSheetService.getSpecSheetById(req.params.id);
    res.status(200).json(specSheet);
  } catch (error) {
    handleControllerError(res, error, "getSpecSheetById");
  }
};

const updateSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const updatedSpecSheet = await specSheetService.updateSpecSheet(req.params.id, req.body);
    res.status(200).json({ message: "Ficha técnica actualizada exitosamente.", specSheet: updatedSpecSheet });
  } catch (error) {
    handleControllerError(res, error, "updateSpecSheet");
  }
};

const deleteSpecSheet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await specSheetService.deleteSpecSheet(req.params.id);
    res.status(200).json({ message: "Ficha técnica eliminada exitosamente." });
  } catch (error) {
    handleControllerError(res, error, "deleteSpecSheet");
  }
};

const changeSpecSheetStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await specSheetService.changeSpecSheetStatus(req.params.id, req.body.status);
    res.status(200).json({ message: "Estado de la ficha técnica actualizado correctamente." });
  } catch (error) {
    handleControllerError(res, error, "changeSpecSheetStatus");
  }
};

const getAllSpecSheetsWithCosts = async (req, res) => {
  try {
      const specSheets = await specSheetService.getAllSpecSheetsWithCosts();
      res.status(200).json(specSheets);
  } catch (error) {
      handleControllerError(res, error, "getAllSpecSheetsWithCosts");
  }
};

// --- FUNCIÓN CLAVE REFACTORIZADA PARA USAR EL SERVICIO ---
const getSpecSheetsByProductId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  try {
    const { idProduct } = req.params;
    const specSheets = await specSheetService.getSpecSheetsByProductId(idProduct);
    res.status(200).json(specSheets);
  } catch (error) {
    handleControllerError(res, error, "getSpecSheetsByProductId");
  }
};

module.exports = {
  createSpecSheet,
  getAllSpecSheets,
  getSpecSheetById,
  updateSpecSheet,
  deleteSpecSheet,
  changeSpecSheetStatus,
  getAllSpecSheetsWithCosts,
  getSpecSheetsByProductId, // Nombre de función claro y consistente
   getSpecSheetsByProduct: getSpecSheetsByProductId
};