// Archivo: services/registroCompraService.js
// VERSIÓN COMPLETA Y FINAL

const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');
const { 
    RegisterPurchase, 
    Provider, 
    Supply, 
    sequelize, 
    PurchaseDetail
} = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

/**
 * Recalcula y guarda los montos totales para una cabecera de compra.
 * Esta función no necesita cambios.
 */
const recalculateAndSaveTotals = async (purchaseId, transaction) => {
    const purchaseInstance = await RegisterPurchase.findByPk(purchaseId, {
        include: [{ model: PurchaseDetail, as: 'details' }],
        transaction
    });

    if (!purchaseInstance) {
        console.warn(`[SERVICE-WARN] Intento de recalcular totales para compra ID ${purchaseId} no encontrada.`);
        return; 
    }

    const calculatedSubtotal = purchaseInstance.details.reduce((sum, detail) => {
        return sum + (Number(detail.subtotal) || 0);
    }, 0);
    
    // Asumiendo que no hay impuestos/descuentos por ahora, el total es igual al subtotal.
    const calculatedTotal = calculatedSubtotal;

    await purchaseInstance.update({
        subtotalAmount: calculatedSubtotal.toFixed(2),
        totalAmount: calculatedTotal.toFixed(2)
    }, { transaction });
};

/**
 * Procesa una compra completa, actualizando el stock directamente en los insumos.
 */
const processFullPurchase = async (purchaseDataFromFrontend) => {
    const {
        idProvider,
        purchaseDate,
        category,
        invoiceNumber,
        receptionDate,
        observations,
        details
    } = purchaseDataFromFrontend;

    if (!idProvider) throw new BadRequestError('El proveedor es obligatorio.');
    if (!details || !Array.isArray(details) || details.length === 0) {
        throw new BadRequestError("Se requiere al menos un detalle de compra.");
    }
    
    const t = await sequelize.transaction();
    try {
        const providerExists = await Provider.findByPk(idProvider, { transaction: t });
        if (!providerExists) throw new NotFoundError(`Proveedor con ID ${idProvider} no encontrado.`);
        if (!providerExists.status) throw new BadRequestError(`El proveedor '${providerExists.company}' no está activo.`);

        const PENDING_STATUS = 'PENDIENTE';

        // 1. Buscar o crear la cabecera de la compra.
        const [purchaseHeader, created] = await RegisterPurchase.findOrCreate({
            where: {
                idProvider: Number(idProvider),
                category: String(category).toUpperCase(),
                status: PENDING_STATUS
            },
            defaults: {
                purchaseDate,
                invoiceNumber: invoiceNumber || null,
                receptionDate: receptionDate || null,
                observations: observations || null,
                status: PENDING_STATUS
            },
            transaction: t
        });

        // Si la compra ya existía (no fue 'created'), actualizamos sus datos.
        if (!created) {
            await purchaseHeader.update({
                purchaseDate,
                invoiceNumber: invoiceNumber || purchaseHeader.invoiceNumber,
                receptionDate: receptionDate || purchaseHeader.receptionDate,
                observations: observations || purchaseHeader.observations,
            }, { transaction: t });
        }
        
        // 2. Procesar detalles, crearlos y actualizar el stock y precio DEL INSUMO.
        for (const detail of details) {
            const quantity = Number(detail.quantity);
            const unitPrice = Number(detail.unitPrice);
            const supplyId = Number(detail.idSupply);

            const supplyToUpdate = await Supply.findByPk(supplyId, { transaction: t });
            if (!supplyToUpdate) {
                throw new NotFoundError(`El insumo con ID ${supplyId} no fue encontrado en el catálogo.`);
            }

            // Crear el registro del detalle de la compra
            await PurchaseDetail.create({
                idRegisterPurchase: purchaseHeader.idRegisterPurchase,
                idSupply: supplyId,
                quantity,
                unitPrice,
                subtotal: quantity * unitPrice
            }, { transaction: t });
            
            // Incrementar el 'stock' en la tabla 'Supplies'
            await Supply.increment('stock', {
                by: quantity,
                where: { idSupply: supplyId },
                transaction: t
            });
            
            console.log(`[SERVICIO-COMPRA] Stock del insumo '${supplyToUpdate.supplyName}' (ID: ${supplyId}) incrementado en ${quantity}.`);

            // Actualizar el último precio en el catálogo de insumos
            await Supply.update({ lastPrice: unitPrice }, { where: { idSupply: supplyId }, transaction: t });
        }
        
        // 3. Recalcular y guardar los totales en la cabecera de la compra.
        await recalculateAndSaveTotals(purchaseHeader.idRegisterPurchase, t);
        
        // 4. Confirmar todos los cambios en la base de datos.
        await t.commit();
        
        return registerPurchaseRepository.getRegisterPurchaseById(purchaseHeader.idRegisterPurchase);

    } catch (error) {
        await t.rollback();
        console.error("Error en servicio processFullPurchase:", error);
        throw error; // Re-lanza el error para que el controlador lo maneje
    }
};

const getAllRegisterPurchasesWithDetails = async () => {
    return registerPurchaseRepository.getAllRegisterPurchases();
};

const getById = async (id) => {
    const purchase = await registerPurchaseRepository.getRegisterPurchaseById(id);
    if (!purchase) {
        throw new NotFoundError(`Compra con ID ${id} no encontrada.`);
    }
    return purchase;
};

const updateHeader = async (idPurchase, headerDataToUpdate) => {
    const t = await sequelize.transaction();
    try {
        const purchase = await RegisterPurchase.findByPk(idPurchase, { transaction: t });
        if (!purchase) throw new NotFoundError(`Compra con ID ${idPurchase} no encontrada.`);
        
        const updated = await registerPurchaseRepository.updateRegisterPurchaseHeader(idPurchase, headerDataToUpdate, t);
        if (!updated) throw new Error("La cabecera de la compra no pudo ser actualizada.");
        
        await t.commit();
        return getById(idPurchase);
    } catch (error) {
        await t.rollback();
        console.error(`Error en servicio updateHeader para ID ${idPurchase}:`, error);
        throw error;
    }
};

const deleteById = async (id) => {
    const t = await sequelize.transaction();
    try {
        const purchase = await RegisterPurchase.findByPk(id, {
            include: [{ model: PurchaseDetail, as: 'details' }],
            transaction: t
        });

        if (!purchase) {
            await t.rollback();
            throw new NotFoundError(`Compra con ID ${id} no encontrada.`);
        }

        if(purchase.status !== 'PENDIENTE') {
            await t.rollback();
            throw new BadRequestError("No se puede eliminar una compra que ya ha sido procesada o pagada. Considere anularla.");
        }
        
        // Revertir el stock de insumos al eliminar la compra
        for (const detail of purchase.details) {
            await Supply.decrement('stock', {
                by: detail.quantity,
                where: { idSupply: detail.idSupply },
                transaction: t
            });
            console.log(`[DELETE-COMPRA] Stock del insumo (ID: ${detail.idSupply}) revertido en ${detail.quantity}.`);
        }
        
        // Eliminar los registros de la compra y sus detalles
        const deleted = await registerPurchaseRepository.deleteRegisterPurchaseAndDetails(id, t);
        if (!deleted) {
            throw new Error("La compra no pudo ser eliminada.");
        }
        
        await t.commit();
        return { message: "Compra eliminada exitosamente." };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const updatePurchaseStatus = async (idPurchase, { status, paymentStatus }) => {
    const t = await sequelize.transaction();
    try {
        const purchase = await RegisterPurchase.findByPk(idPurchase, { transaction: t });
        if (!purchase) throw new NotFoundError(`Compra con ID ${idPurchase} no encontrada.`);

        const fieldsToUpdate = {};
        if (status !== undefined) fieldsToUpdate.status = status;
        if (paymentStatus !== undefined) fieldsToUpdate.paymentStatus = paymentStatus;

        if (Object.keys(fieldsToUpdate).length === 0) {
            throw new BadRequestError('No se especificó ningún estado para actualizar.');
        }

        await registerPurchaseRepository.updateStatus(idPurchase, fieldsToUpdate, t);
        await t.commit();
        return getById(idPurchase);
    } catch (error) {
        await t.rollback();
        console.error(`Error en servicio updatePurchaseStatus para ID ${idPurchase}:`, error);
        throw error;
    }
};

const getProvidersByCategory = async (categoryName) => {
    // Suponiendo que el modelo tiene una lista de categorías válidas para validación
    if (RegisterPurchase.ALLOWED_CATEGORIES && !RegisterPurchase.ALLOWED_CATEGORIES.includes(categoryName.toUpperCase())) {
        throw new BadRequestError(`Categoría '${categoryName}' no es válida.`);
    }
    return registerPurchaseRepository.getProvidersByCategory(categoryName.toUpperCase());
};

module.exports = {
    processFullPurchase,
    getAllRegisterPurchasesWithDetails,
    getById,
    updateHeader,
    deleteById,
    updatePurchaseStatus,
    getProvidersByCategory,
    recalculateAndSaveTotals,
};