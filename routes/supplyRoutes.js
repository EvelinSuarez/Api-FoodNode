// routes/supplyRoutes.js
const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController'); // Renombrado
const { // Importar validaciones renombradas
    createSupplyValidation,
    updateSupplyValidation,
    getSupplyByIdValidation,
    deleteSupplyValidation,
    changeSupplyStatusValidation,
} = require('../middlewares/supplyValidations'); // Renombrado
// const authMiddleware = require('../middlewares/authMiddleware');

// router.use(authMiddleware.verifyToken); // Para proteger todas las rutas de insumos

router.get('/',
    // authMiddleware.checkPermissions(['READ_SUPPLY']), // Ejemplo
    supplyController.getAllSupplies
);

router.get('/:idSupply', // Cambiado de 'id' a 'idSupply' para claridad
    // authMiddleware.checkPermissions(['READ_SUPPLY']),
    getSupplyByIdValidation,
    supplyController.getSupplyById
);

router.post('/',
    // authMiddleware.checkPermissions(['CREATE_SUPPLY']),
    createSupplyValidation,
    supplyController.createSupply
);

router.put('/:idSupply', // Cambiado de 'id' a 'idSupply'
    // authMiddleware.checkPermissions(['UPDATE_SUPPLY']),
    updateSupplyValidation,
    supplyController.updateSupply
);

router.delete('/:idSupply', // Cambiado de 'id' a 'idSupply'
    // authMiddleware.checkPermissions(['DELETE_SUPPLY']),
    deleteSupplyValidation,
    supplyController.deleteSupply
);

// PATCH es más semántico para actualizaciones parciales como cambiar un solo campo (status)
router.patch('/:idSupply/status', // Ruta más específica para cambiar estado
    // authMiddleware.checkPermissions(['UPDATE_SUPPLY_STATUS']), // Permiso más granular
    changeSupplyStatusValidation,
    supplyController.changeSupplyStatus
);

module.exports = router;