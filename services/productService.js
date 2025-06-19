// services/productService.js

const productRepository = require('../repositories/productRepository');
// Asegúrate de importar SpecSheet aquí para poder consultarlo.
const { Product, SpecSheet, Supplier, ProductSheet } = require('../models'); 

// ... tu función createProduct, adjustStock, etc., no cambian ...

const createProduct = async (productData) => {
    const existingProduct = await productRepository.findProductByName(productData.productName);
    if (existingProduct) {
        throw new Error('El nombre del producto ya existe.');
    }
    return productRepository.createProduct(productData);
};

const adjustStock = async (productId, quantity, type, reason) => {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    throw new Error('Producto no encontrado para ajustar stock.');
  }
  const adjustmentAmount = parseFloat(quantity);
  const currentStock = parseFloat(product.currentStock);
  let newStock;
  if (type === 'entrada') {
    newStock = currentStock + adjustmentAmount;
  } else {
    newStock = currentStock - adjustmentAmount;
    if (newStock < 0) {
      throw new Error('El ajuste de salida no puede resultar en stock negativo.');
    }
  }
  await productRepository.updateStock(productId, newStock);
  return productRepository.getProductById(productId);
};


// ======================= ¡ESTA ES LA FUNCIÓN CLAVE A MODIFICAR! =======================
const getAllProducts = async () => {
    // 1. Obtenemos los productos desde el repositorio.
    // La lista ya viene con el campo 'specSheetCount' gracias a tu subconsulta.
    const productsFromRepo = await productRepository.getAllProducts();

    if (!productsFromRepo || productsFromRepo.length === 0) {
        return [];
    }

    // 2. Ahora, enriquecemos cada producto con 'activeSpecSheetId'.
    // Usamos Promise.all para hacerlo de forma eficiente y en paralelo.
    const enrichedProducts = await Promise.all(
        productsFromRepo.map(async (product) => {
            // Convertimos el objeto de Sequelize a un objeto JSON plano.
            const productJSON = product.toJSON();

            // 3. Buscamos la ficha técnica activa para este producto.
            const activeSpecSheet = await SpecSheet.findOne({
                where: {
                    idProduct: product.idProduct,
                    status: true // Asumimos que una ficha activa tiene `status: true`.
                },
                attributes: ['idSpecSheet'] // Solo necesitamos el ID para ser más rápidos.
            });

            // 4. Añadimos el nuevo campo 'activeSpecSheetId' al objeto.
            // Si se encuentra una ficha activa, usamos su ID, si no, es null.
            productJSON.activeSpecSheetId = activeSpecSheet ? activeSpecSheet.idSpecSheet : null;

            return productJSON;
        })
    );

    // 5. Devolvemos la lista de productos completamente enriquecida.
    return enrichedProducts;
};
// ======================================================================================

const getProductById = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado.');
    }
    // NOTA: Si necesitas los detalles para una sola vista de producto,
    // también deberías aplicar esta lógica de enriquecimiento aquí.
    return product;
};

// ... el resto de tus funciones (update, delete, etc.) no necesitan cambios ...

const updateProduct = async (id, productData) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para actualizar.');
    }
    if (productData.productName && productData.productName !== product.productName) {
        const existingProduct = await productRepository.findProductByName(productData.productName);
        if (existingProduct && existingProduct.idProduct !== parseInt(id)) {
            throw new Error('Ya existe otro producto con este nombre.');
        }
    }
    return productRepository.updateProduct(id, productData);
};

const deleteProduct = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para eliminar.');
    }
    return productRepository.deleteProduct(id);
};

const changeStateProduct = async (id, state) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para cambiar estado.');
    }
    if (typeof state !== 'boolean') {
        throw new Error('El estado proporcionado no es válido.');
    }
    return productRepository.changeStateProduct(id, state);
};

const getProductsBySupplier = async (idInsumoMaestro) => {
    const products = await Product.findAll({
        include: [{
            model: SpecSheet,
            as: 'specSheets',
            required: true, 
            include: [{
                model: Supplier, 
                as: 'ingredients',
                where: { idSupplier: idInsumoMaestro }, 
                required: true, 
                through: {
                    model: ProductSheet,
                    attributes: [] 
                }
            }]
        }],
        distinct: true 
    });
    return products;
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    changeStateProduct,
    getProductsBySupplier,
    adjustStock 
};