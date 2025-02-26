const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const providerValidations = require('../middlewares/providerValidations');

router.get('/', providerController.getAllProvider);
router.get('/:idProvider', providerValidations.getProviderByIdValidation, providerController.getProviderById);
router.post('/', providerValidations.createProviderValidation, providerController.createProvider);
router.put('/:id', providerValidations.updateProviderValidation, providerController.updateProvider);
router.delete('/:idProvider', providerValidations.deleteProviderValidation, providerController.deleteProvider);
router.patch('/:id', providerValidations.changeStateValidation, providerController.changeStateProvider);

module.exports = router;