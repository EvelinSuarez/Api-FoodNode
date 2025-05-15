const express = require('express');
const router = express.Router();

// Importar el controlador UNA SOLA VEZ
const processDetailController = require('../controllers/processDetailController');
const processDetailValidations = require('../middlewares/processDetailValidations'); // Asumiendo que este archivo existe y exporta los middlewares

// --- Rutas Principales CRUD ---
router.get('/', processDetailController.getAllProcessDetails);

router.post('/',
    processDetailValidations.createProcessDetailValidation, // Validación para la creación
    processDetailController.createProcessDetail
);

// --- Rutas Específicas ANTES de rutas con parámetros más genéricos ---
router.get('/active', processDetailController.getActiveProcessDetails);

// --- Rutas para obtener por diferentes entidades relacionadas ---
router.get('/order/:idOrder',
    // processDetailValidations.validateIdOrderParam, // Ejemplo de validación si la tienes
    processDetailController.getProcessDetailsByProductionOrder // Método del controlador corregido
);

router.get('/process/:idProcess',
    processDetailValidations.getProcessDetailsByProcessValidation,
    processDetailController.getProcessDetailsByProcess
);

router.get('/specsheet/:idSpecSheet', // o 'spec-sheet' si esa es tu convención
    processDetailValidations.getProcessDetailsBySpecSheetValidation,
    processDetailController.getProcessDetailsBySpecSheet
);

router.get('/employee/:idEmployee',
    processDetailValidations.getProcessDetailsByEmployeeValidation,
    processDetailController.getProcessDetailsByEmployee
);

// --- Rutas para un ProcessDetail específico por su ID (debe ir después de /active, /order/:idOrder etc.) ---
router.get('/:id',
    processDetailValidations.getProcessDetailByIdValidation,
    processDetailController.getProcessDetailById
);

router.put('/:id',
    processDetailValidations.updateProcessDetailValidation, // Validación para la actualización
    processDetailController.updateProcessDetail
);

router.patch('/:id/status', // Asumiendo que 'changeStateValidation' valida el ID y el 'status' en el body
    processDetailValidations.changeStateValidation,
    processDetailController.changeStateProcessDetail
);
// Si changeStateProcessDetail solo cambia el estado, considera si un PATCH a /:id
// con { status: true/false } es más RESTful que una subruta /status.
// Pero /:id/status también es una práctica común y aceptable.

router.delete('/:id',
    processDetailValidations.deleteProcessDetailValidation, // Validación para la eliminación
    processDetailController.deleteProcessDetail
);


module.exports = router;