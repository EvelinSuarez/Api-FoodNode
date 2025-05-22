// repositories/registerPurchaseRepository.js
const { RegisterPurchase, PurchaseDetail, Provider, Supplier, sequelize } = require('../models');

const createRegisterPurchase = async (registerPurchaseData) => {
    const t = await sequelize.transaction();
    try {
        const { idProvider, purchaseDate, category, totalAmount, details } = registerPurchaseData;

        const providerExists = await Provider.findByPk(idProvider, { transaction: t });
        if (!providerExists) {
            throw new Error(`Proveedor con ID ${idProvider} no encontrado.`);
        }

        if (!details || !Array.isArray(details) || details.length === 0) {
             throw new Error('No se proporcionaron detalles válidos para la compra.');
        }

        const insumoIds = details.map(d => d.idInsumo);
        const existingInsumos = await Supplier.findAll({
            where: { idSupplier: insumoIds },
            attributes: ['idSupplier'],
            transaction: t
        });
        if (existingInsumos.length !== insumoIds.length) {
            const existingIdsSet = new Set(existingInsumos.map(i => i.idSupplier));
            const missingId = insumoIds.find(id => !existingIdsSet.has(parseInt(id, 10)));
            throw new Error(`Insumo con ID ${missingId || 'desconocido'} no encontrado.`);
        }

        const newPurchase = await RegisterPurchase.create({
            idProvider,
            purchaseDate,
            category, // <--- CATEGORY AÑADIDA
            totalAmount: Number(totalAmount) || 0,
            status: 'PENDIENTE',
            details: details.map(detail => ({
                idSupplier: detail.idInsumo,
                quantity: Number(detail.quantity),
                unitPrice: Number(detail.unitPrice),
                subtotal: (Number(detail.quantity || 0) * Number(detail.unitPrice || 0)).toFixed(2)
            }))
        }, {
            include: [{
                model: PurchaseDetail,
                as: 'details'
            }],
            transaction: t
        });

        await t.commit();
        return newPurchase;

    } catch (error) {
        if (t && !t.finished) { // Asegurar rollback si la transacción está activa y no finalizada
             try { await t.rollback(); } catch (rbError) { console.error("Error en rollback:", rbError); }
        }
        console.error("Error detallado en repositorio createRegisterPurchase:", error);
        throw new Error(`Error en base de datos al crear la compra: ${error.message}`);
    }
};

const getAllRegisterPurchases = async () => {
    return RegisterPurchase.findAll({
        include: [
            { model: Provider, as: 'provider', attributes: ['idProvider', 'company'] },
            {
                model: PurchaseDetail,
                as: 'details',
                attributes: ['idPurchaseDetail', 'quantity', 'unitPrice', 'subtotal'],
                include: [{
                    model: Supplier, as: 'insumo',
                    attributes: ['idSupplier', 'supplierName', 'measurementUnit']
                }]
            }
        ],
        order: [['purchaseDate', 'DESC'], ['idRegisterPurchase', 'DESC']]
    });
};

const getRegisterPurchaseById = async (idPurchase) => {
    return RegisterPurchase.findByPk(idPurchase, {
        include: [
            { model: Provider, as: 'provider', attributes: ['idProvider', 'company'] },
            {
                model: PurchaseDetail,
                as: 'details',
                attributes: ['idPurchaseDetail', 'quantity', 'unitPrice', 'subtotal'],
                include: [{
                    model: Supplier, as: 'insumo',
                    attributes: ['idSupplier', 'supplierName', 'measurementUnit']
                }]
            }
        ]
    });
};

async function getUniqueProvidersFromCategory(categoryName) {
    try {
        const allPurchasesInCategory = await RegisterPurchase.findAll({
            where: { category: categoryName },
            include: [{
                model: Provider,
                as: 'provider',
                attributes: ['idProvider', 'company'], // 'company' o el campo de nombre de proveedor
                required: true
            }]
        });

        const uniqueProviders = [];
        const providerMap = new Map();
        allPurchasesInCategory.forEach(purchase => {
            if (purchase.provider && !providerMap.has(purchase.provider.idProvider)) {
                providerMap.set(purchase.provider.idProvider, true);
                uniqueProviders.push(purchase.provider);
            }
        });
        return uniqueProviders;
    } catch (error) {
        console.error(`Error fetching unique providers for category ${categoryName}:`, error);
        throw error;
    }
}

const updateRegisterPurchase = async (idPurchase, registerPurchaseData) => {
    // Excluir detalles y campos que no se deben actualizar directamente aquí (como idProvider)
    const { details, idProvider, ...fieldsToUpdate } = registerPurchaseData;

    const allowedUpdates = {};
    const modelAttributes = Object.keys(RegisterPurchase.getAttributes());
    for (const key in fieldsToUpdate) {
        // Permitir actualizar 'category', 'purchaseDate', 'totalAmount', 'status'
        if (modelAttributes.includes(key) && key !== 'idRegisterPurchase' && key !== 'idProvider') {
            allowedUpdates[key] = fieldsToUpdate[key];
        }
    }
    // 'category' se incluirá en allowedUpdates si viene en registerPurchaseData

    if (Object.keys(allowedUpdates).length === 0) {
        console.warn(`No se proporcionaron campos válidos para actualizar en la cabecera de la compra ID ${idPurchase}.`);
        return false;
    }

    const [numberOfAffectedRows] = await RegisterPurchase.update(allowedUpdates, {
        where: { idRegisterPurchase: idPurchase }
    });
    return numberOfAffectedRows > 0;
};

const deleteRegisterPurchase = async (idPurchase) => {
    const numberOfDeletedRows = await RegisterPurchase.destroy({
        where: { idRegisterPurchase: idPurchase }
    });
    return numberOfDeletedRows > 0;
};

const changeStateRegisterPurchase = async (idPurchase, newStatus) => {
    const [numberOfAffectedRows] = await RegisterPurchase.update({ status: newStatus }, {
        where: { idRegisterPurchase: idPurchase }
    });
    return numberOfAffectedRows > 0;
}

module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    getUniqueProvidersFromCategory,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};