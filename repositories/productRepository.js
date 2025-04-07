const Product = require('../models/Product');

const createProduct = async (productData) => {
    try {
        const product = await Product.create(productData);
        return product;
    } catch (error) {
        throw new Error(`Error al crear el producto: ${error.message}`);
    }
};

const getAllProducts = async () => {
    try {
        console.log('Buscando productos en la base de datos...');
        const products = await Product.findAll({
            where: { status: true }
        });
        console.log(`Encontrados ${products.length} productos`);
        return products;
    } catch (error) {
        console.error('Error detallado en repository:', error);
        throw new Error(`Error al obtener los productos: ${error.message}`);
    }
};
const getProductById = async (id) => {
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    } catch (error) {
        throw new Error(`Error al obtener el producto: ${error.message}`);
    }
};

const updateProduct = async (IdProduct, product) => {
    return Product.update(product, { where: { IdProduct } });
}

const deleteProduct = async (IdProduct) => {
    return Product.destroy({ where: { IdProduct } });
}

const changeStateProduct = async (IdProduct, state) => {
    return Product.update({ state }, { where: { IdProduct } });
}

const getProductsBySupplier = async (IdSupplier) => {
    return Product.findAll({ where: { IdSupplier } });
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