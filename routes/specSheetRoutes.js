const express = require("express");
const router = express.Router();
const specSheetController = require("../controllers/specSheetsController");
const specSheetValidations = require("../middlewares/specSheetsValidations");

// Colocar esta ruta antes de otras rutas que usen parámetros
router.get(
  "/product/:idProduct",
  specSheetValidations.getSpecSheetsByProductValidation,
  specSheetController.getSpecSheetsByProduct
);


router.get("/", specSheetController.getAllSpecSheets);
router.get(
  "/:id",
  specSheetValidations.getSpecSheetByIdValidation,
  specSheetController.getSpecSheetById
);
router.post(
  "/",
  specSheetValidations.createSpecSheetValidation,
  specSheetController.createSpecSheet
);
router.put(
  "/:id",
  specSheetValidations.updateSpecSheetValidation,
  specSheetController.updateSpecSheet
);
router.delete("/:id",specSheetValidations.deleteSpecSheetValidation,specSheetController.deleteSpecSheet
);
router.patch("/:id/status", specSheetController.changeStateSpecSheet);

module.exports = router;
