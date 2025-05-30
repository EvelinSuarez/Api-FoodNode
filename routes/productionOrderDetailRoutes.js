// routes/productionOrderDetailRoutes.js
const express = require('express');
const router = express.Router();
const podController = require('../controllers/productionOrderDetailController'); // POD = ProductionOrderDetail
const {
    addStepToOrderValidation,
    getProductionOrderDetailsByOrderValidation, // Cambiar nombre en validaciones
    getProductionOrderDetailByIdValidation,
    deleteProductionOrderDetailValidation,
    getStepsByEmployeeValidation,
} = require('../middlewares/productionOrderDetailValidations'); // Renombrar archivo de validaciones
// const authMiddleware = require('../middlewares/authMiddleware');

// router.use(authMiddleware.verifyToken);

// NO es común tener un POST /production-order-details/ para crear un detalle huérfano.
// La creación de pasos se hace anidada: POST /production-orders/:idProductionOrder/steps
router.post('/production-orders/:idProductionOrder/steps', // Ruta anidada para añadir un paso
    addStepToOrderValidation,
    podController.addStepToOrder
);

// Obtener todos los pasos de una orden específica
router.get('/production-orders/:idProductionOrder/steps',
    getProductionOrderDetailsByOrderValidation, // Valida idProductionOrder
    podController.getProductionOrderDetailsByOrder
);

// Obtener un paso específico por su ID
router.get('/:idProductionOrderDetail',
    getProductionOrderDetailByIdValidation,
    podController.getProductionOrderDetailById
);

// Eliminar un paso específico (usar con precaución)
// Podría ser /production-orders/:idProductionOrder/steps/:idProductionOrderDetail para más contexto
router.delete('/:idProductionOrderDetail',
    deleteProductionOrderDetailValidation,
    podController.deleteProductionOrderDetail
);

// Rutas para reportes / vistas específicas
router.get('/employee/:idEmployee',
    getStepsByEmployeeValidation,
    podController.getStepsByEmployee
);

router.get('/status/active', // Ruta para obtener todos los pasos activos en el sistema
    podController.getActiveStepsOverall
);


// El UPDATE de un ProductionOrderDetail (asignar empleado, fechas, estado)
// se maneja a través de: PATCH /production-orders/:idProductionOrder/steps/:idProductionOrderDetail
// en productionOrderRoutes.js, por lo que no se necesita una ruta PUT/PATCH aquí.

module.exports = router;