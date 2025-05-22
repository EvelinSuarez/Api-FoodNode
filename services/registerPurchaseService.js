// services/registerPurchaseService.js
const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');
const { RegisterPurchase, PurchaseDetail, Provider, Supplier, sequelize } = require('../models');

const processPurchaseSubmission = async (purchaseDataFromFrontend) => {
    const { idProvider, purchaseDate, category, details, totalAmount: frontendTotal } = purchaseDataFromFrontend;

    if (!idProvider || !purchaseDate || !category || !details || !Array.isArray(details) || details.length === 0) {
        throw new Error("Datos de compra incompletos o inválidos (proveedor, fecha, categoría o detalles faltantes).");
    }

    const t = await sequelize.transaction();
    let purchaseIdToReturn = null;
    let transactionCommitted = false;

    try {
        const providerExists = await Provider.findByPk(idProvider, { transaction: t });
        if (!providerExists) {
            throw new Error(`Proveedor con ID ${idProvider} no encontrado.`);
        }

        const insumoIds = details.map(d => Number(d.idInsumo)).filter(id => !isNaN(id) && id > 0);
        if (insumoIds.length !== details.length) {
             throw new Error("ID de insumo inválido o faltante en uno de los detalles.");
        }
        const existingInsumos = await Supplier.findAll({
            where: { idSupplier: insumoIds }, attributes: ['idSupplier'], transaction: t
        });
        if (existingInsumos.length !== insumoIds.length) {
            const existingIdsSet = new Set(existingInsumos.map(i => i.idSupplier));
            const missingId = insumoIds.find(id => !existingIdsSet.has(id));
            throw new Error(`Insumo con ID ${missingId || 'desconocido'} no encontrado.`);
        }

        // Lógica para encontrar o crear/actualizar la compra
        // Asumimos que una compra para un proveedor es "única" si está PENDIENTE,
        // o ajusta este 'where' según tu lógica de negocio para agrupar compras.
        // Si la categoría también define la unicidad de la cabecera de compra, añádela al where.
        // Ejemplo: where: { idProvider: idProvider, category: category, status: 'PENDIENTE' }
        let purchase = await RegisterPurchase.findOne({
            where: { idProvider: idProvider /*, status: 'PENDIENTE' */ }, // Considera si 'category' debe estar aquí
            include: [{ model: PurchaseDetail, as: 'details' }],
            transaction: t
        });

        let wasCreated = false;

        if (!purchase) {
            wasCreated = true;
            console.log(`INFO: Creando nueva compra para proveedor ${idProvider}, categoría ${category}`);
            const newPurchaseData = { idProvider, purchaseDate, category, totalAmount: frontendTotal || 0, details };
            // El repositorio createRegisterPurchase maneja su propia transacción interna.
            // Si falla, hará rollback y lanzará error.
            const createdPurchase = await registerPurchaseRepository.createRegisterPurchase(newPurchaseData);
            
            if (!createdPurchase || !createdPurchase.idRegisterPurchase) {
                 throw new Error("El repositorio no devolvió una compra válida después de crear.");
            }
            purchaseIdToReturn = createdPurchase.idRegisterPurchase;
            purchase = createdPurchase; // Para consistencia, aunque no se use más abajo en este bloque

        } else {
            purchaseIdToReturn = purchase.idRegisterPurchase;
            wasCreated = false;
            console.log(`INFO: Actualizando compra existente ID: ${purchaseIdToReturn}`);

            // Actualizar campos de la cabecera si es necesario
            let headerChanged = false;
            if (purchase.category !== category) {
                purchase.category = category;
                headerChanged = true;
            }
            // Podrías querer actualizar purchaseDate también si es relevante
            // if (purchase.purchaseDate !== purchaseDate) { // Cuidado con formatos de fecha
            //     purchase.purchaseDate = purchaseDate;
            //     headerChanged = true;
            // }

            const existingDetailsMap = new Map();
            (purchase.details || []).forEach(detail => { existingDetailsMap.set(detail.idSupplier, detail); });

            for (const detailFromFrontend of details) {
                const insumoId = Number(detailFromFrontend.idInsumo);
                const newQuantity = Number(detailFromFrontend.quantity);
                const newUnitPrice = Number(detailFromFrontend.unitPrice);
                
                if (isNaN(insumoId) || insumoId <= 0 || isNaN(newQuantity) || newQuantity <= 0 || isNaN(newUnitPrice) || newUnitPrice < 0) {
                    console.warn("WARN: Detalle inválido omitido:", detailFromFrontend); continue;
                }

                const existingDetail = existingDetailsMap.get(insumoId);
                if (existingDetail) {
                    const currentQty = Number(existingDetail.quantity) || 0;
                    existingDetail.quantity = currentQty + newQuantity;
                    existingDetail.unitPrice = newUnitPrice; // Siempre actualiza al precio más reciente
                    existingDetail.subtotal = (existingDetail.quantity * existingDetail.unitPrice).toFixed(2);
                    await existingDetail.save({ transaction: t });
                } else {
                    await PurchaseDetail.create({
                        idRegisterPurchase: purchase.idRegisterPurchase, idSupplier: insumoId,
                        quantity: newQuantity, unitPrice: newUnitPrice,
                        subtotal: (newQuantity * newUnitPrice).toFixed(2)
                    }, { transaction: t });
                }
            }

            const allFinalDetails = await PurchaseDetail.findAll({
                where: { idRegisterPurchase: purchase.idRegisterPurchase },
                attributes: ['subtotal'], transaction: t
            });
            const newTotalAmount = allFinalDetails.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);
            
            if (purchase.totalAmount !== newTotalAmount.toFixed(2)) {
                purchase.totalAmount = newTotalAmount.toFixed(2);
                headerChanged = true;
            }

            if (headerChanged) {
                await purchase.save({ transaction: t });
            }
        }

        if (!purchaseIdToReturn) throw new Error("ID de compra inválido antes del commit.");
        
        await t.commit();
        transactionCommitted = true;

        const finalPurchaseData = await registerPurchaseRepository.getRegisterPurchaseById(purchaseIdToReturn);
        if (!finalPurchaseData) {
            console.error(`ERROR CRÍTICO: No se pudo recuperar la compra ID ${purchaseIdToReturn} después del commit.`);
            throw new Error(`No se pudo recuperar la compra final (ID: ${purchaseIdToReturn}) después de la operación.`);
        }
        return { purchase: finalPurchaseData, created: wasCreated };

    } catch (error) {
        console.error("ERROR en servicio processPurchaseSubmission:", error.message, error.stack);
        if (!transactionCommitted && t && t.finished !== 'commit' && t.finished !== 'rollback') {
             try { await t.rollback(); } catch (rollbackError) { console.error("ERROR CRÍTICO: Falla durante el rollback:", rollbackError); }
        }
        throw error; // Relanza para que el controlador lo maneje
    }
};

const getProvidersByCategory = async (categoryName) => {
    if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
        throw new Error("El nombre de la categoría es inválido o está vacío.");
    }
    return registerPurchaseRepository.getUniqueProvidersFromCategory(categoryName);
};

const updatePurchaseHeader = async (purchaseId, dataToUpdate) => {
    // El repositorio updateRegisterPurchase ya filtra los campos permitidos.
    // Aquí se podría añadir lógica de negocio específica antes de llamar al repo.
    const updated = await registerPurchaseRepository.updateRegisterPurchase(purchaseId, dataToUpdate);
    if (updated) {
        return registerPurchaseRepository.getRegisterPurchaseById(purchaseId); // Devolver la compra actualizada
    }
    return null; // O false, si se prefiere indicar solo si hubo o no actualización
};

module.exports = {
    processPurchaseSubmission,
    getAllRegisterPurchases: () => registerPurchaseRepository.getAllRegisterPurchases(),
    getRegisterPurchaseById: (id) => registerPurchaseRepository.getRegisterPurchaseById(id),
    deleteRegisterPurchase: (id) => registerPurchaseRepository.deleteRegisterPurchase(id),
    changeStateRegisterPurchase: (id, status) => registerPurchaseRepository.changeStateRegisterPurchase(id, status),
    getProvidersByCategory,
    updatePurchaseHeader, // Para la ruta PUT de solo actualizar cabecera
};