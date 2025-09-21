// RUTA: /routes/productionOrderRoutes.js
// VERSIÓN TOTALMENTE COMPLETA Y FINAL (Lógica por Peso)

const express = require('express');
const router = express.Router();

const {
    loadProductionOrder,
    createProductionOrderValidation,
    commonIdParamsValidation,
    updateProductionOrderValidation,
    updateProductionOrderStepValidation,
    finalizeProductionOrderValidation,
    changeProductionOrderStatusValidation,
    deleteProductionOrderValidation,
    getAllProductionOrdersQueryValidation,
    startProductionValidation
} = require('../middlewares/productionOrderValidations');

const productionOrderController = require('../controllers/productionOrderController');

// --- Rutas de Órdenes de Producción ---

// --- RUTA PARA VERIFICAR STOCK ANTES DE CREAR (BASADO EN PESO) ---
router.post('/check-stock',
    productionOrderController.checkStockAvailability
);

// Crear una nueva orden
router.post('/',
    createProductionOrderValidation,
    productionOrderController.createProductionOrder
);

// Iniciar producción y descontar insumos
router.post('/:idProductionOrder/start',
    commonIdParamsValidation,
    loadProductionOrder,
    startProductionValidation,
    productionOrderController.startProductionAndDeductSupplies
);

// Verificar si un producto tiene una orden activa
router.get('/check-active/:idProduct',
    productionOrderController.checkActiveOrderForProduct
);

// Obtener todas las órdenes con filtros
router.get('/',
    getAllProductionOrdersQueryValidation,
    productionOrderController.getAllProductionOrders
);

// Obtener una orden por su ID
router.get('/:idProductionOrder',
    commonIdParamsValidation,
    productionOrderController.getProductionOrderById
);

// Actualizar datos generales de una orden
router.put('/:idProductionOrder',
    commonIdParamsValidation,
    loadProductionOrder,
    updateProductionOrderValidation,
    productionOrderController.updateProductionOrder
);

// Actualizar un paso específico de la producción
router.patch('/:idProductionOrder/steps/:idProductionOrderDetail',
    commonIdParamsValidation,
    loadProductionOrder,
    updateProductionOrderStepValidation,
    productionOrderController.updateProductionOrderStep
);

// Finalizar una orden
router.post('/:idProductionOrder/finalize',
    commonIdParamsValidation,
    loadProductionOrder,
    finalizeProductionOrderValidation,
    productionOrderController.finalizeProductionOrder
);

// Cambiar el estado de una orden (Pausar, Cancelar, etc.)
router.patch('/:idProductionOrder/status',
    commonIdParamsValidation,
    loadProductionOrder,
    changeProductionOrderStatusValidation,
    productionOrderController.changeProductionOrderStatus
);

// Eliminar una orden
router.delete('/:idProductionOrder',
    commonIdParamsValidation,
    loadProductionOrder,
    deleteProductionOrderValidation,
    productionOrderController.deleteProductionOrder
);

module.exports = router;    