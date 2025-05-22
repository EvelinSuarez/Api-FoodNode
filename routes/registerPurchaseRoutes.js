// routes/registerPurchaseRoutes.js (ejemplo)
const express = require('express');
const router = express.Router();

const registerPurchaseController = require('../controllers/registerPurchaseController');
// Importar el objeto de validaciones
const { 
    validateIdParam, 
    validateCreateOrUpdatePurchase, 
    validateUpdatePurchase, 
    changeStateValidation 
} = require('../middlewares/registerPurchaseValidations');

// GET /api/registerpurchases/
router.get('/', registerPurchaseController.getAllRegisterPurchases);

// GET /api/registerpurchases/providers/meat
router.get('/providers/meat', registerPurchaseController.getProvidersFromMeatCategory);

// GET /api/registerpurchases/:idPurchase
router.get('/:idPurchase', validateIdParam, registerPurchaseController.getRegisterPurchaseById);

// POST /api/registerpurchases/
router.post('/', validateCreateOrUpdatePurchase, registerPurchaseController.createRegisterPurchase);

// PUT /api/registerpurchases/:idPurchase
router.put('/:idPurchase', validateUpdatePurchase, registerPurchaseController.updateRegisterPurchase);

// DELETE /api/registerpurchases/:idPurchase
router.delete('/:idPurchase', validateIdParam, registerPurchaseController.deleteRegisterPurchase);

// PATCH /api/registerpurchases/:idPurchase/state
router.patch('/:idPurchase/state', changeStateValidation, registerPurchaseController.changeStateRegisterPurchase);

module.exports = router;