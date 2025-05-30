const express = require('express');
const router = express.Router();
const registerPurchaseController = require('../controllers/registerPurchaseController');
const {
    validateIdParam,
    createPurchaseWithDetailsValidationRules,
    updatePurchaseHeaderValidationRules,
    changeStateValidationRules 
} = require('../middlewares/registerPurchaseValidations');

// GET /api/registerpurchases/ - Obtener todas las compras
router.get('/', registerPurchaseController.getAllPurchases);

// POST /api/registerpurchases/ - Crear una nueva compra con sus detalles
router.post('/', createPurchaseWithDetailsValidationRules, registerPurchaseController.createPurchaseWithDetails);

// GET /api/registerpurchases/providers/meat - Obtener proveedores para categoría "CARNE"
// La lógica de "CARNE" está en el controlador/servicio para esta ruta específica.
router.get('/providers/meat', registerPurchaseController.getProvidersByCategoryController);
// Si quisieras una ruta más genérica:
// router.get('/providers/by-category/:categoryName', [param('categoryName').isIn(ALLOWED_PURCHASE_CATEGORIES)], registerPurchaseController.getProvidersByCategoryControllerDinamic);


// GET /api/registerpurchases/:idPurchase - Obtener una compra por ID
router.get('/:idPurchase', validateIdParam, registerPurchaseController.getPurchaseById);

// PUT /api/registerpurchases/:idPurchase - Actualizar la cabecera de una compra
router.put('/:idPurchase', validateIdParam, updatePurchaseHeaderValidationRules, registerPurchaseController.updatePurchaseHeader);

// DELETE /api/registerpurchases/:idPurchase - Eliminar una compra
router.delete('/:idPurchase', validateIdParam, registerPurchaseController.deletePurchaseById);

// PATCH /api/registerpurchases/:idPurchase/status - Actualizar el estado y/o estado de pago de una compra
router.patch('/:idPurchase/status', validateIdParam, changeStateValidationRules, registerPurchaseController.updatePurchaseStatusController);
module.exports = router;