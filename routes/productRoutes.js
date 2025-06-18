const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// --- ESTA ES LA CORRECCIÓN CLAVE ---
// 1. La ruta ahora es '../middleware/productValidations.js'
// 2. Usamos desestructuración para importar solo las validaciones que necesitamos.
const {
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductByIdValidation,
  changeStateValidation,
  getProductsBySupplierValidation,
  adjustStockValidation // La nueva validación
} = require('../middlewares/productValidations'); 


// --- Rutas para Productos e Insumos ---

// Obtener todos los productos/insumos
router.get('/', productController.getAllProducts);

// Obtener un producto/insumo por su ID
router.get('/:id', getProductByIdValidation, productController.getProductById);

// Obtener productos por proveedor
router.get('/supplier/:idSupplier', getProductsBySupplierValidation, productController.getProductsBySupplier);

// Crear un nuevo producto/insumo
router.post('/', createProductValidation, productController.createProduct);

// Actualizar un producto/insumo existente
router.put('/:id', updateProductValidation, productController.updateProduct);

// Eliminar un producto/insumo
router.delete('/:id', deleteProductValidation, productController.deleteProduct);

// Cambiar el estado (activar/desactivar) de un producto/insumo
// NOTA: El frontend está enviando PATCH a /:id/status. Vamos a ajustar la ruta para que coincida.
router.patch('/:id/status', changeStateValidation, productController.changeStateProduct);

// Ajustar el stock manualmente (Añadir o quitar)
// El frontend está enviando POST a /:id/adjust-stock. Usamos POST porque es una acción.
router.post('/:id/adjust-stock', adjustStockValidation, productController.adjustStock);

module.exports = router;