// Archivo: routes/productRoutes.js
// --- VERSIÓN COMPLETA CON LA NUEVA RUTA PARA AJUSTE DE VENTA ---

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Importamos las validaciones desde el archivo correspondiente
const {
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
  getProductByIdValidation,
  changeStateValidation,
  getProductsBySupplierValidation,
  adjustStockValidation,
  // --- NUEVO: Importar la validación para el ajuste de venta ---
  adjustSaleStockValidation // Asumimos que crearás esta validación
} = require('../middlewares/productValidations'); 


// --- Rutas para Productos e Insumos ---

// Obtener todos los productos/insumos
router.get('/', productController.getAllProducts);

// Obtener un producto/insumo por su ID
router.get('/:id', getProductByIdValidation, productController.getProductById);

// Obtener productos por proveedor (Ruta corregida para evitar conflictos con /:id)
router.get('/by-supplier/:idSupplier', getProductsBySupplierValidation, productController.getProductsBySupplier);

// Crear un nuevo producto/insumo
router.post('/', createProductValidation, productController.createProduct);

// Actualizar un producto/insumo existente
router.put('/:id', updateProductValidation, productController.updateProduct);

// Eliminar un producto/insumo
router.delete('/:id', deleteProductValidation, productController.deleteProduct);

// Cambiar el estado (activar/desactivar) de un producto/insumo
router.patch('/:id/status', changeStateValidation, productController.changeStateProduct);

// Ajustar el stock de INSUMOS (currentStock)
router.post('/:id/adjust-stock', adjustStockValidation, productController.adjustStock);


// --- NUEVA RUTA PARA AJUSTAR STOCK DE VENTA (stockForSale) ---
router.post(
    '/:id/adjust-sale-stock', 
    adjustSaleStockValidation, // Usamos la nueva validación
    productController.adjustStockBySale
);


module.exports = router;