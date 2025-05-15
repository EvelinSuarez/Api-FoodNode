const express = require('express');
const router = express.Router();

const registerPurchaseController = require('../controllers/registerPurchaseController');
const registerPurchaseValidations = require('../middlewares/registerPurchaseValidations'); // Ajusta la ruta si es necesario

router.get('/', registerPurchaseController.getAllRegisterPurchases);
router.get('/:idPurchase',registerPurchaseValidations.validateIdParam, registerPurchaseController.getRegisterPurchaseById);
router.get('/providers/meat', registerPurchaseController.getProvidersFromMeatCategory);
router.post('/',registerPurchaseValidations.validateCreateOrUpdatePurchase, registerPurchaseController.createRegisterPurchase);
router.put('/:idPurchase',registerPurchaseValidations.validateUpdatePurchase, registerPurchaseController.updateRegisterPurchase);
router.delete('/:idPurchase',registerPurchaseValidations.validateIdParam, registerPurchaseController.deleteRegisterPurchase);
router.patch('/:idPurchase/state', registerPurchaseValidations.changeStateValidation, registerPurchaseController.changeStateRegisterPurchase);


module.exports = router;