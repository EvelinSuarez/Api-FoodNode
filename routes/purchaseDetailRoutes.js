const express = require('express');
const router = express.Router();
const purchaseDetailController = require('../controllers/purchaseDetailController');
const purchaseDetailValidations = require('../middlewares/purchaseDetailValidations');

router.get('/', purchaseDetailController.getAllPurchaseDetails);
router.get('/:idDetail', purchaseDetailValidations.getPurchaseDetailByIdValidation, purchaseDetailController.getPurchaseDetailById);
router.post('/', purchaseDetailValidations.createPurchaseDetailValidation, purchaseDetailController.createPurchaseDetail);
router.put('/:idDetail', purchaseDetailValidations.updatePurchaseDetailValidation, purchaseDetailController.updatePurchaseDetail);
router.delete('/:idDetail', purchaseDetailValidations.deletePurchaseDetailValidation, purchaseDetailController.deletePurchaseDetail);
router.patch('/:idDetail', purchaseDetailValidations.changeStateValidation, purchaseDetailController.changeStatePurchaseDetail);

module.exports = router;
