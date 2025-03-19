const express = require('express');
const router = express.Router();
const productSheetController = require('../controllers/productSheetController');
const productSheetValidations = require('../middlewares/productSheetValidations');

router.get('/', productSheetController.getAllProductSheets);
router.get('/:id', productSheetValidations.getProductSheetByIdValidation, productSheetController.getProductSheetById);
router.post('/', productSheetValidations.createProductSheetValidation, productSheetController.createProductSheet);
router.put('/:id', productSheetValidations.updateProductSheetValidation, productSheetController.updateProductSheet);
router.delete('/:id', productSheetValidations.deleteProductSheetValidation, productSheetController.deleteProductSheet);

// Additional routes for getting ProductSheets by SpecSheet and Supplier
router.get('/specsheet/:idSpecSheet', 
    productSheetValidations.getProductSheetsBySpecSheetValidation, 
    productSheetController.getProductSheetsBySpecSheet);
router.get('/supplier/:idSupplier', 
    productSheetValidations.getProductSheetsBySupplierValidation, 
    productSheetController.getProductSheetsBySupplier);

module.exports = router;