// services/productService.js
const productRepository = require('../repositories/productRepository');
const { Product, SpecSheet, Supplier, ProductSheet } = require('../models'); // Acceso directo para consultas complejas

const createProduct = async (productData) => {
    // Lógica para verificar si ya existe por nombre, etc.
    const existingProduct = await productRepository.findProductByName(productData.productName);
    if (existingProduct) {
        throw new Error('El nombre del producto ya existe.');
    }
    return productRepository.createProduct(productData);
};

const getAllProducts = async () => {
    return productRepository.getAllProducts();
};

const getProductById = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado.');
    }
    return product;
};

const updateProduct = async (id, productData) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para actualizar.');
    }
    // Lógica para verificar si el nuevo nombre ya existe en otro producto
    if (productData.productName && productData.productName !== product.productName) {
        const existingProduct = await productRepository.findProductByName(productData.productName);
        if (existingProduct && existingProduct.idProduct !== parseInt(id)) {
            throw new Error('Ya existe otro producto con este nombre.');
        }
    }
    return productRepository.updateProduct(id, productData);
};

const deleteProduct = async (id) => {
    // Considerar validaciones: ¿El producto tiene fichas técnicas asociadas? ¿Órdenes de producción?
    // Si es así, ¿se permite eliminar o se debe desactivar?
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para eliminar.');
    }
    // Ejemplo de validación:
    // const specSheets = await SpecSheet.count({ where: { idProduct: id } });
    // if (specSheets > 0) {
    //   throw new Error('No se puede eliminar el producto porque tiene fichas técnicas asociadas.');
    // }
    return productRepository.deleteProduct(id);
};

const changeStateProduct = async (id, state) => {
    const product = await productRepository.getProductById(id);
    if (!product) {
        throw new Error('Producto no encontrado para cambiar estado.');
    }
    // Si state es undefined, podría ser un error de payload
    if (typeof state !== 'boolean') {
        throw new Error('El estado proporcionado no es válido.');
    }
    return productRepository.changeStateProduct(id, state);
};

// Esta función es la que necesita una lógica clara.
// Asumiendo que quieres "Productos finales que usan un InsumoMaestro (Supplier) específico"
const getProductsBySupplier = async (idInsumoMaestro) => {
    // Esta es una consulta compleja que involucra Product -> SpecSheet -> ProductSheet -> Supplier (InsumoMaestro)
    const products = await Product.findAll({
        include: [{
            model: SpecSheet,
            as: 'specSheets',
            required: true, // Solo productos que tengan fichas técnicas
            include: [{
                model: Supplier, // Tu InsumoMaestro
                as: 'ingredients',
                where: { idSupplier: idInsumoMaestro }, // Filtra por el InsumoMaestro específico
                required: true, // Solo fichas que usen este insumo
                through: {
                    model: ProductSheet,
                    attributes: [] // No necesitamos atributos de ProductSheet para esta consulta particular
                }
            }]
        }],
        distinct: true // Para evitar productos duplicados si múltiples fichas usan el mismo insumo
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
};