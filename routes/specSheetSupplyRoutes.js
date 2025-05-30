// routes/specSheetSupplyRoutes.js
const express = require("express");
const router = express.Router();
const specSheetSupplyController = require("../controllers/specSheetSupplyController");
const {
  createSpecSheetSupplyValidation,
  updateSpecSheetSupplyValidation,
  deleteSpecSheetSupplyValidation,
  getSpecSheetSupplyByIdValidation,
  getSuppliesBySpecSheetValidation,
  getSpecSheetsBySupplyValidation,
} = require("../middlewares/specSheetSupplyValidations");
// const authMiddleware = require('../middlewares/authMiddleware');

// router.use(authMiddleware.verifyToken); // Aplicar autenticación globalmente si es necesario

// Ruta base: /api/spec-sheet-supplies (o como lo definas en app.js)

// Añadir un insumo a una ficha técnica (idSpecSheet y idSupply van en el body)
router.post(
  "/",
  // authMiddleware.checkPermissions(['CREATE_SPEC_SHEET_SUPPLY']),
  createSpecSheetSupplyValidation,
  specSheetSupplyController.addSupplyToSpecSheet
);

// Obtener todos los insumos de una ficha técnica específica
router.get(
  "/by-spec-sheet/:idSpecSheet",
  // authMiddleware.checkPermissions(['READ_SPEC_SHEET_SUPPLY']),
  getSuppliesBySpecSheetValidation,
  specSheetSupplyController.getSuppliesBySpecSheetId
);

// Obtener un registro específico de insumo-ficha por su PK (idSpecSheetSupply)
router.get(
  "/:idSpecSheetSupply",
  // authMiddleware.checkPermissions(['READ_SPEC_SHEET_SUPPLY']),
  getSpecSheetSupplyByIdValidation,
  specSheetSupplyController.getSpecSheetSupplyById
);

// Actualizar un insumo dentro de una ficha (ej: cantidad, notas)
router.put(
  "/:idSpecSheetSupply",
  // authMiddleware.checkPermissions(['UPDATE_SPEC_SHEET_SUPPLY']),
  updateSpecSheetSupplyValidation,
  specSheetSupplyController.updateSupplyInSpecSheet
);

// Eliminar un insumo de una ficha técnica
router.delete(
  "/:idSpecSheetSupply",
  // authMiddleware.checkPermissions(['DELETE_SPEC_SHEET_SUPPLY']),
  deleteSpecSheetSupplyValidation,
  specSheetSupplyController.removeSupplyFromSpecSheet
);

// Obtener todas las fichas técnicas que utilizan un insumo específico
router.get(
  "/by-supply/:idSupply",
  // authMiddleware.checkPermissions(['READ_SPEC_SHEET_SUPPLY']),
  getSpecSheetsBySupplyValidation,
  specSheetSupplyController.getSpecSheetsBySupplyId
);

// Opcional: GET / para listar todos los SpecSheetSupply (puede ser muy grande)
// router.get("/", specSheetSupplyController.getAllSpecSheetSupplies);

module.exports = router;