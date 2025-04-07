const express = require('express');
const router = express.Router();
const productionOrderController = require('../controllers/productionOrderController');
const productionOrderValidations = require('../middlewares/productionOrderValidations');


// Asegúrate de que los nombres coincidan con el controlador
router.get('/', productionOrderController.getAllProductionOrders); // Correcto: Directamente la función del controlador

router.get('/:id',productionOrderValidations.getProductionOrderByIdValidation, // Middleware de validación
productionOrderController.getProductionOrderById // Controlador
);

router.post('/',
  productionOrderValidations.createProductionOrderValidation, // Middleware de validación
  productionOrderController.createProductionOrder // Controlador
);

router.put('/:id',
  productionOrderValidations.updateProductionOrderValidation, // Middleware de validación
  productionOrderController.updateProductionOrder // Controlador
);

router.delete('/:id',
  productionOrderValidations.deleteProductionOrderValidation, // Middleware de validación
  productionOrderController.deleteProductionOrder // Controlador
);

router.patch('/:id',
  productionOrderValidations.changeStateValidation, // Middleware de validación
  productionOrderController.changeStateProductionOrder // Controlador
);

module.exports = router;