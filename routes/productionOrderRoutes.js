// routes/productionOrderRoutes.js
const express = require('express');
const router = express.Router();

// --- Importaciones de Middlewares y Controladores ---

// ÚNICA importación de las validaciones y middlewares de productionOrderValidations
const {
    loadProductionOrder, // Middleware para cargar la orden
    createProductionOrderValidation,
    commonIdParamsValidation,
    updateProductionOrderValidation,
    updateProductionOrderStepValidation,
    finalizeProductionOrderValidation,
    changeProductionOrderStatusValidation,
    deleteProductionOrderValidation,
    getAllProductionOrdersQueryValidation
} = require('../middlewares/productionOrderValidations');

// Importación del controlador
const productionOrderController = require('../controllers/productionOrderController');

// router.use(authMiddleware.verifyToken); // Aplicar autenticación globalmente si es necesario

router.post('/',
    // authMiddleware.hasPermission('production_order_create'), // Ejemplo de permiso específico
    createProductionOrderValidation,
    productionOrderController.createProductionOrder
);

router.get('/check-active/:idProduct', productionOrderController.checkActiveOrderForProduct);

router.get('/',
    getAllProductionOrdersQueryValidation, // Validar query params para el listado
    productionOrderController.getAllProductionOrders
);

router.get('/:idProductionOrder',
    commonIdParamsValidation, // Valida el formato del ID
    // loadProductionOrder no es necesario aquí si el controlador o servicio maneja la carga con detalles.
    // Si getProductionOrderById solo devuelve el objeto, y necesitas la instancia para algo más en la cadena,
    // podrías añadir loadProductionOrder aquí.
    productionOrderController.getProductionOrderById
);

router.put('/:idProductionOrder', // PUT para actualización general de la orden
    commonIdParamsValidation,
    loadProductionOrder, // Carga la instancia de la orden en req.productionOrderInstance
    updateProductionOrderValidation,
    productionOrderController.updateProductionOrder
);

router.patch('/:idProductionOrder/steps/:idProductionOrderDetail', // PATCH para actualizar un paso específico
    commonIdParamsValidation, // Para :idProductionOrder
    loadProductionOrder, // Carga la orden principal
    updateProductionOrderStepValidation, // Valida :idProductionOrderDetail y carga el paso en req.productionStepInstance
    productionOrderController.updateProductionOrderStep
);

router.post('/:idProductionOrder/finalize',
    commonIdParamsValidation,
    loadProductionOrder,
    finalizeProductionOrderValidation,
    productionOrderController.finalizeProductionOrder
);

router.patch('/:idProductionOrder/status', // PATCH para cambiar el estado de la orden
    commonIdParamsValidation,
    loadProductionOrder,
    changeProductionOrderStatusValidation,
    productionOrderController.changeProductionOrderStatus
);

router.delete('/:idProductionOrder',
    commonIdParamsValidation,
    loadProductionOrder,
    deleteProductionOrderValidation,
    productionOrderController.deleteProductionOrder
);

module.exports = router;