// routes/productionOrderSupplyRoutes.js
const express = require('express');
const router = express.Router();
const productionOrderSupplyController = require('../controllers/productionOrderSupplyController');
const {
    addConsumedSuppliesValidation,
    getConsumedSuppliesByOrderValidation,
    getConsumedSupplyByIdValidation,
    updateConsumedSupplyRecordValidation,
    deleteConsumedSupplyRecordValidation,
} = require('../middlewares/productionOrderSupplyValidations');
// const authMiddleware = require('../middlewares/authMiddleware'); // Descomentar si se usa autenticación

// router.use(authMiddleware.verifyToken); // Aplicar a todas las rutas de este módulo

// Registrar uno o más insumos consumidos para una orden de producción
router.post('/production-orders/:idProductionOrder/supplies',
    // authMiddleware.checkPermissions(['CREATE_PRODUCTION_ORDER_SUPPLY']), // Ejemplo de permiso
    addConsumedSuppliesValidation,
    productionOrderSupplyController.addConsumedSuppliesToOrder
);

// Obtener todos los insumos consumidos para una orden de producción específica
router.get('/production-orders/:idProductionOrder/supplies',
    // authMiddleware.checkPermissions(['READ_PRODUCTION_ORDER_SUPPLY']),
    getConsumedSuppliesByOrderValidation,
    productionOrderSupplyController.getConsumedSuppliesByOrder
);

// Obtener un registro de consumo específico por su ID (de ProductionOrderSupply)
// Esta ruta es más directa si solo tienes el ID del registro de consumo.
router.get('/production-order-supplies/:idProductionOrderSupply',
    // authMiddleware.checkPermissions(['READ_PRODUCTION_ORDER_SUPPLY']),
    getConsumedSupplyByIdValidation,
    productionOrderSupplyController.getConsumedSupplyById
);

// Actualizar un registro de consumo específico
// La ruta incluye idProductionOrder para el contexto y validación de pertenencia.
router.put('/production-orders/:idProductionOrder/supplies/:idProductionOrderSupply',
    // authMiddleware.checkPermissions(['UPDATE_PRODUCTION_ORDER_SUPPLY']),
    updateConsumedSupplyRecordValidation,
    productionOrderSupplyController.updateConsumedSupplyRecord
);

// Eliminar un registro de consumo específico
// La ruta incluye idProductionOrder para el contexto y validación de pertenencia.
router.delete('/production-orders/:idProductionOrder/supplies/:idProductionOrderSupply',
    // authMiddleware.checkPermissions(['DELETE_PRODUCTION_ORDER_SUPPLY']),
    deleteConsumedSupplyRecordValidation,
    productionOrderSupplyController.deleteConsumedSupplyRecord
);

module.exports = router;