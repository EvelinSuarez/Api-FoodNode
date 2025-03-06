const express = require('express');
const router = express.Router();
const specSheetController = require('../controllers/spechsheetController');
const specSheetValidations = require('../middlewares/spechsheetValidations');

router.get('/', specSheetController.getAllSpecSheets);
router.get('/:id', specSheetValidations.getSpecSheetByIdValidation, specSheetController.getSpecSheetById);
router.post('/', specSheetValidations.createSpecSheetValidation, specSheetController.createSpecSheet);
router.put('/:id', specSheetValidations.updateSpecSheetValidation, specSheetController.updateSpecSheet);
router.delete('/:id', specSheetValidations.deleteSpecSheetValidation, specSheetController.deleteSpecSheet);
router.patch('/:id', specSheetValidations.changeStateValidation, specSheetController.changeStateSpecSheet);

// Ruta adicional para obtener fichas técnicas por producto
router.get('/product/:idProduct', specSheetValidations.getSpecSheetsByProductValidation, specSheetController.getSpecSheetsByProduct);

module.exports = router;