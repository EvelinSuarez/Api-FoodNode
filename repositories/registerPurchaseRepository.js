// Archivo: repositories/registerPurchaseRepository.js

const { RegisterPurchase, PurchaseDetail, Provider, Supply, sequelize } = require('../models');

const createRegisterPurchaseWithDetails = async (purchaseHeaderData, detailsData, transaction) => {
    const newPurchase = await RegisterPurchase.create(purchaseHeaderData, { transaction });

    const purchaseDetailsToCreate = detailsData.map(detail => ({
        idRegisterPurchase: newPurchase.idRegisterPurchase,
        idSupply: detail.idSupply,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
    }));

    await PurchaseDetail.bulkCreate(purchaseDetailsToCreate, {
        transaction,
        individualHooks: true 
    });

    return newPurchase;
};

const getAllRegisterPurchases = async () => {
    // <<< --- ESTA ES LA FUNCIÓN MÁS IMPORTANTE PARA TU PROBLEMA --- >>>
    // Devuelve TODAS las compras, incluyendo sus detalles, y dentro de cada detalle, el insumo asociado.
    // Esto es exactamente lo que el frontend necesita para poblar el selector de la Ficha Técnica.
    return RegisterPurchase.findAll({
        include: [
            { 
                model: Provider, 
                as: 'provider', 
                attributes: ['idProvider', 'company'] 
            },
            {
                model: PurchaseDetail,
                as: 'details',
                include: [{ 
                    model: Supply, 
                    as: 'supply', 
                    attributes: ['idSupply', 'supplyName', 'unitOfMeasure'] 
                }]
            }
        ],
        order: [['idRegisterPurchase', 'DESC']] 
    });
};

const getRegisterPurchaseById = async (idPurchase) => {
    return RegisterPurchase.findByPk(idPurchase, {
        include: [
            { model: Provider, as: 'provider' },
            {
                model: PurchaseDetail,
                as: 'details',
                include: [{ model: Supply, as: 'supply' }]
            }
        ]
    });
};

const getProvidersByCategory = async (categoryName) => {
    return Provider.findAll({
        attributes: ['idProvider', 'company', 'status'],
        include: [{
            model: RegisterPurchase,
            as: 'purchases', 
            where: { category: categoryName },
            attributes: [], 
            required: true 
        }],
        where: { status: true },
    });
};

const updateRegisterPurchaseHeader = async (idPurchase, headerData, transaction) => {
    const [numberOfAffectedRows] = await RegisterPurchase.update(headerData, {
        where: { idRegisterPurchase: idPurchase },
        transaction
    });
    return numberOfAffectedRows > 0;
};

const deleteRegisterPurchaseAndDetails = async (idPurchase, transaction) => {
    const numberOfAffectedRows = await RegisterPurchase.destroy({
        where: { idRegisterPurchase: idPurchase },
        transaction
    });
    return numberOfAffectedRows > 0;
};

const updateStatus = async (idPurchase, statusFields, transaction) => {
    const [affectedRows] = await RegisterPurchase.update(statusFields, {
      where: { idRegisterPurchase: idPurchase },
      transaction,
    });
    return affectedRows > 0;
};

module.exports = {
    createRegisterPurchaseWithDetails,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    getProvidersByCategory,
    updateRegisterPurchaseHeader,
    deleteRegisterPurchaseAndDetails,
    updateStatus,
};