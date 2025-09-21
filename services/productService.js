// RUTA: services/productService.js
// --- VERSIÓN COMPLETA Y FINAL (ESTRATEGIA CORREGIDA) ---

const productRepository = require('../repositories/productRepository');
// Importamos todos los modelos necesarios.
const { 
    Product, 
    SpecSheet, 
    SpecSheetSupply,
    Supply, 
    PurchaseDetail, 
    RegisterPurchase, 
    Provider, 
    sequelize 
} = require('../models');
const { NotFoundError, BadRequestError, ApplicationError } = require('../utils/customErrors');

// ... (Las funciones createProduct, adjustStock, adjustStockBySale no cambian) ...

const createProduct = async (productData) => {
    const existingProduct = await productRepository.findProductByName(productData.productName);
    if (existingProduct) {
        throw new BadRequestError('El nombre del producto ya existe.');
    }
    return productRepository.createProduct(productData);
};

const adjustStock = async (productId, quantity, type, reason) => {
    const product = await productRepository.getProductById(productId);
    if (!product) {
        throw new NotFoundError('Producto no encontrado para ajustar stock.');
    }
    const adjustmentAmount = parseFloat(quantity);
    const currentStock = parseFloat(product.currentStock);
    let newStock;
    if (type === 'entrada') {
        newStock = currentStock + adjustmentAmount;
    } else {
        newStock = currentStock - adjustmentAmount;
        if (newStock < 0) {
            throw new BadRequestError('El ajuste de salida no puede resultar en stock negativo.');
        }
    }
    await productRepository.updateStock(productId, newStock);
    return productRepository.getProductById(productId);
};

const adjustStockBySale = async (productId, adjustmentData) => {
    const t = await sequelize.transaction();
    try {
        const { quantitySold, reason } = adjustmentData;
        if (!quantitySold || isNaN(parseFloat(quantitySold)) || parseFloat(quantitySold) <= 0) {
            throw new BadRequestError("La cantidad vendida debe ser un número positivo.");
        }
        const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product) throw new NotFoundError("Producto no encontrado.");
        if (parseFloat(product.stockForSale) < parseFloat(quantitySold)) {
            throw new BadRequestError(`Stock para venta insuficiente. Disponible: ${product.stockForSale}`);
        }
        await product.decrement('stockForSale', { by: parseFloat(quantitySold), transaction: t });
        await t.commit();
        return await Product.findByPk(productId);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
        console.error("Error en adjustStockBySale:", error);
        throw new ApplicationError("Ocurrió un error al registrar la venta.");
    }
};

// ======================= ¡ESTA ES LA FUNCIÓN CLAVE CON LA LÓGICA FINAL! =======================
const getAllProducts = async () => {
    try {
        const productsFromRepo = await productRepository.getAllProducts();
        if (!productsFromRepo || productsFromRepo.length === 0) return [];

        const enrichedProducts = await Promise.all(
            productsFromRepo.map(async (product) => {
                const productJSON = product.toJSON();

                const activeSpecSheet = await SpecSheet.findOne({
                    where: { idProduct: product.idProduct, status: true },
                    include: [{
                        model: SpecSheetSupply,
                        as: 'specSheetSupplies',
                        required: false,
                        limit: 1,
                        include: [
                            // 1. Incluimos el detalle del insumo sin filtros.
                            {
                                model: Supply,
                                as: 'supply',
                                required: true,
                            },
                            // 2. Incluimos el detalle de la compra para poder anidar y filtrar.
                            {
                                model: PurchaseDetail,
                                as: 'purchaseDetail',
                                required: true,
                                include: [{
                                    model: RegisterPurchase,
                                    as: 'registerPurchase',
                                    required: true,
                                    // 3. ¡AQUÍ ESTÁ LA NUEVA LÓGICA! Filtramos por la categoría de la compra.
                                    where: { category: 'CARNE' }, // <<< ¡Ajusta esta categoría si es necesario!
                                    attributes: ['idProvider']
                                }]
                            }
                        ]
                    }],
                });

                if (activeSpecSheet && activeSpecSheet.specSheetSupplies && activeSpecSheet.specSheetSupplies.length > 0) {
                    const mainIngredient = activeSpecSheet.specSheetSupplies[0];
                    if (mainIngredient.purchaseDetail && mainIngredient.purchaseDetail.registerPurchase) {
                        productJSON.mainIngredientProviderId = mainIngredient.purchaseDetail.registerPurchase.idProvider;
                    } else {
                        productJSON.mainIngredientProviderId = null;
                    }
                } else {
                    productJSON.mainIngredientProviderId = null;
                }
                
                return productJSON;
            })
        );
        return enrichedProducts;

    } catch (error) {
        console.error("Error detallado en el servicio getAllProducts:", error);
        throw new ApplicationError("Ocurrió un error interno al obtener la lista de productos.");
    }
};
// ======================================================================================

const getProductById = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError('Producto no encontrado.');
    return product;
};

const updateProduct = async (id, productData) => {
    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError('Producto no encontrado para actualizar.');
    if (productData.productName && productData.productName !== product.productName) {
        const existingProduct = await productRepository.findProductByName(productData.productName);
        if (existingProduct && existingProduct.idProduct !== parseInt(id)) {
            throw new BadRequestError('Ya existe otro producto con este nombre.');
        }
    }
    await productRepository.updateProduct(id, productData);
    return productRepository.getProductById(id);
};

const deleteProduct = async (id) => {
    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError('Producto no encontrado para eliminar.');
    return productRepository.deleteProduct(id);
};

const changeStateProduct = async (id, state) => {
    if (typeof state !== 'boolean') throw new BadRequestError('El estado proporcionado no es válido.');
    const product = await productRepository.getProductById(id);
    if (!product) throw new NotFoundError('Producto no encontrado para cambiar estado.');
    return productRepository.changeStateProduct(id, state);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    changeStateProduct,
    adjustStock,
    adjustStockBySale
};