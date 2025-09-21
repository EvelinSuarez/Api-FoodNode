// Archivo: controllers/productController.js
// --- VERSIÓN CORREGIDA Y MEJORADA CON NUEVA FUNCIÓN Y MANEJO DE ERRORES ---

const { validationResult } = require("express-validator");
const productService = require("../services/productService");
const { NotFoundError, BadRequestError } = require('../utils/customErrors'); // Asumiendo que tienes errores custom

// --- NUEVO: Helper para manejar errores de forma consistente ---
const handleControllerError = (res, error, operation) => {
    console.error(`Controlador[${operation}]:`, error); // Loguear el error completo
    if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
    }
    if (error instanceof BadRequestError || error.message.includes('insuficiente') || error.message.includes('ya existe')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: `Error interno en ${operation}.`, details: error.message });
};


const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    handleControllerError(res, error, "createProduct");
  }
};

const adjustStock = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    // Se extrae la cantidad y el motivo del cuerpo de la solicitud
    const { quantity, reason } = req.body; 
    // El tipo 'entrada' se asume para este endpoint específico
    const updatedProduct = await productService.adjustStock(id, quantity, 'entrada', reason);
    res.status(200).json({ message: "Stock de insumos ajustado exitosamente", product: updatedProduct });
  } catch (error) {
    handleControllerError(res, error, "adjustStock");
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    handleControllerError(res, error, "getAllProducts");
  }
};

const getProductById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    handleControllerError(res, error, "getProductById");
  }
};

const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ message: "Producto actualizado", product: updatedProduct });
  } catch (error) {
    handleControllerError(res, error, "updateProduct");
  }
};

const deleteProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: "Producto eliminado exitosamente." });
  } catch (error) {
    handleControllerError(res, error, "deleteProduct");
  }
};

const changeStateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Corregido: el estado viene en req.body.status, no req.body.state
    await productService.changeStateProduct(req.params.id, req.body.status); 
    res.status(200).json({ message: "Estado del producto actualizado." });
  } catch (error) {
    handleControllerError(res, error, "changeStateProduct");
  }
};

const getProductsBySupplier = async (req, res) => {
  // ... (sin cambios)
};

// --- NUEVA FUNCIÓN CONTROLADORA ---
const adjustStockBySale = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const updatedProduct = await productService.adjustStockBySale(id, req.body);
        res.status(200).json({ message: "Stock de venta ajustado exitosamente.", product: updatedProduct });
    } catch (error) {
        handleControllerError(res, error, "adjustStockBySale");
    }
};

// --- EXPORTACIONES ACTUALIZADAS ---
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  changeStateProduct,
  getProductsBySupplier,
  adjustStock,
  adjustStockBySale // <-- Añadido
};