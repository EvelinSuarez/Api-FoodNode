const productRepository = require('../repositories/productRepository');

const createProduct = async (product) => {
    return productRepository.createProduct(product);
}

const getAllProducts = async () => {
    try {
        return await productRepository.getAllProducts();
    } catch (error) {
        throw new Error("Error al obtener los productos: " + error.message);
    }
};
const getProductById = async (id) => {
    return productRepository.getProductById(id);
}

const updateProduct = async (id, product) => {
    return productRepository.updateProduct(id, product);
}

const deleteProduct = async (id) => {
    return productRepository.deleteProduct(id);
}

const changeStateProduct = async (id, state) => {
    return productRepository.changeStateProduct(id, state);
}

const getProductsBySupplier = async (idSupplier) => {
    return productRepository.getProductsBySupplier(idSupplier);
}

module.exports = {
        createProduct,
        getAllProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        changeStateProduct,
        getProductsBySupplier
    };