const express = require('express');
const router = express.Router();
const registerPurchaseController = require('../controllers/registerPurchaseController');
const registerPurchaseValidations = require('../middlewares/registerPurchaseValidations');

router.get('/', registerPurchaseController.getAllRegisterPurchases);
router.get('/:idPurchase', registerPurchaseValidations.getRegisterPurchaseByIdValidation, registerPurchaseController.getRegisterPurchaseById);
router.post('/', registerPurchaseValidations.createRegisterPurchaseValidation, registerPurchaseController.createRegisterPurchase);
router.put('/:idPurchase', registerPurchaseValidations.updateRegisterPurchaseValidation, registerPurchaseController.updateRegisterPurchase);
router.delete('/:idPurchase', registerPurchaseValidations.deleteRegisterPurchaseValidation, registerPurchaseController.deleteRegisterPurchase);
router.patch('/:idPurchase', registerPurchaseValidations.changeStateValidation, registerPurchaseController.changeStateRegisterPurchase);

module.exports = router;
