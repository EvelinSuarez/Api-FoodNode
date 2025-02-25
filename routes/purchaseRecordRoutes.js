const express = require('express');
const router = express.Router();
const purchaseRecordController = require('../controllers/purchaseRecordController');
const purchaseRecordValidations = require('../middlewares/purchaseRecordValidations');

router.get('/', purchaseRecordController.getAllPurchaseRecords);
router.get('/:id', purchaseRecordValidations.getPurchaseRecordByIdValidation, purchaseRecordController.getPurchaseRecordById);
router.post('/', purchaseRecordValidations.createPurchaseRecordValidation, purchaseRecordController.createPurchaseRecord);
router.put('/:id', purchaseRecordValidations.updatePurchaseRecordValidation, purchaseRecordController.updatePurchaseRecord);
router.delete('/:id', purchaseRecordValidations.deletePurchaseRecordValidation, purchaseRecordController.deletePurchaseRecord);
router.patch('/:id', purchaseRecordValidations.changeStateValidation, purchaseRecordController.changeStatePurchaseRecord);

module.exports = router;
