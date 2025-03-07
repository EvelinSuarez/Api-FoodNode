const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productValidations = require('../middlewares/productValidations');

router.get('/', productController.getAllProducts);
router.get('/:id', productValidations.getProductByIdValidation, productController.getProductById);
router.post('/', productValidations.createProductValidation, productController.createProduct);
router.put('/:id', productValidations.updateProductValidation, productController.updateProduct);
router.delete('/:id', productValidations.deleteProductValidation, productController.deleteProduct);
router.patch('/:id', productValidations.changeStateValidation, productController.changeStateProduct);

// Ruta adicional para obtener productos por proveedor
router.get('/supplier/:idSupplier', productValidations.getProductsBySupplierValidation, productController.getProductsBySupplier);

module.exports = router;