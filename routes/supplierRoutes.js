const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const supplierValidations = require('../middlewares/supplierValidations');

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierValidations.getSupplierByIdValidation, supplierController.getSupplierById);
router.post('/', supplierValidations.createSupplierValidation, supplierController.createSupplier);
router.put('/:id', supplierValidations.updateSupplierValidation, supplierController.updateSupplier);
router.delete('/:id', supplierValidations.deleteSupplierValidation, supplierController.deleteSupplier);
router.patch('/:id', supplierValidations.changeStateValidation, supplierController.changeStateSupplier);

module.exports = router;