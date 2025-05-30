const express = require("express");
const router = express.Router();
const specSheetProcessController = require("../controllers/specSheetProcessController");
const { // Nombres actualizados de las validaciones
  createSpecSheetProcessValidation,
  updateSpecSheetProcessValidation,
  getSpecSheetProcessByIdValidation,
  deleteSpecSheetProcessValidation,
  getAllProcessesBySpecSheetValidation, // Esta era para /specsheet/:idSpecSheet
} = require("../middlewares/specSheetProcessValidations");
// const authMiddleware = require('../middlewares/authMiddleware'); // Descomentar si se usa

// router.use(authMiddleware.verifyToken);

// Crear un nuevo proceso DENTRO de una ficha técnica (el idSpecSheet va en el body)
router.post(
  "/", // Ruta base para crear SpecSheetProcess
  // authMiddleware.checkPermissions(['CREATE_SPEC_SHEET_PROCESS']),
  createSpecSheetProcessValidation,
  specSheetProcessController.createSpecSheetProcess
);

// Obtener todos los procesos de una ficha técnica específica
router.get(
  "/by-spec-sheet/:idSpecSheet", // Ruta más descriptiva
  // authMiddleware.checkPermissions(['READ_SPEC_SHEET_PROCESS']),
  getAllProcessesBySpecSheetValidation, // Valida param('idSpecSheet')
  specSheetProcessController.getAllProcessesBySpecSheetId
);

// Obtener un proceso específico por su ID (idSpecSheetProcess)
router.get(
  "/:idSpecSheetProcess",
  // authMiddleware.checkPermissions(['READ_SPEC_SHEET_PROCESS']),
  getSpecSheetProcessByIdValidation,
  specSheetProcessController.getSpecSheetProcessById
);

// Actualizar un proceso específico
router.put(
  "/:idSpecSheetProcess",
  // authMiddleware.checkPermissions(['UPDATE_SPEC_SHEET_PROCESS']),
  updateSpecSheetProcessValidation,
  specSheetProcessController.updateSpecSheetProcess
);

// Eliminar un proceso específico
router.delete(
  "/:idSpecSheetProcess",
  // authMiddleware.checkPermissions(['DELETE_SPEC_SHEET_PROCESS']),
  deleteSpecSheetProcessValidation,
  specSheetProcessController.deleteSpecSheetProcess
);

module.exports = router;