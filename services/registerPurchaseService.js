const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');
const { RegisterPurchase, Provider, Supply, sequelize, PurchaseDetail } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

/**
 * Recalcula y guarda los montos totales para una cabecera de compra.
 * (Esta función no necesita cambios)
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

    let calculatedSubtotal = 0;
    if (purchaseInstance.details && purchaseInstance.details.length > 0) {
        calculatedSubtotal = purchaseInstance.details.reduce((sum, detail) => {
            const detailSubtotal = parseFloat(detail.subtotal);
            return sum + (isNaN(detailSubtotal) ? 0 : detailSubtotal);
        }, 0);
    }
    
    const calculatedTotal = calculatedSubtotal;

    await purchaseInstance.update({
        subtotalAmount: calculatedSubtotal.toFixed(2),
        totalAmount: calculatedTotal.toFixed(2)
    }, { transaction });
};

// <<< --- ESTA ES LA FUNCIÓN CON LA LÓGICA CLAVE MODIFICADA --- >>>
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

    // --- Validaciones iniciales (sin cambios) ---
    if (!idProvider) throw new BadRequestError('El proveedor es obligatorio.');
    const providerExists = await Provider.findByPk(idProvider);
    if (!providerExists) throw new NotFoundError(`Proveedor con ID ${idProvider} no encontrado.`);
    if (!providerExists.status) throw new BadRequestError(`El proveedor '${providerExists.company}' no está activo.`);

    if (!details || !Array.isArray(details) || details.length === 0) {
        throw new BadRequestError("Se requiere al menos un detalle de compra.");
    }
    
    const supplyIds = details.map(d => parseInt(d.idSupply, 10)).filter(id => !isNaN(id));
    if (supplyIds.length !== details.length) {
        throw new BadRequestError("ID de insumo inválido o faltante en uno de los detalles.");
    }
    
    const existingSupplies = await Supply.findAll({ where: { idSupply: { [Op.in]: supplyIds }, status: true } });
    if (existingSupplies.length !== supplyIds.length) {
        const foundIds = existingSupplies.map(s => s.idSupply);
        const missingOrInactiveIds = supplyIds.filter(id => !foundIds.includes(id));
        throw new BadRequestError(`Insumos no encontrados o inactivos: IDs ${missingOrInactiveIds.join(', ')}.`);
    }
    
    const t = await sequelize.transaction();
    try {
        // 1. Buscar una compra existente PENDIENTE para el proveedor y categoría
        let purchaseHeader = await RegisterPurchase.findOne({
            where: {
                idProvider: Number(idProvider),
                category: String(category).toUpperCase(),
                status: 'PENDIENTE'
            },
            transaction: t
        });

        // 2. Si no existe, crear una nueva cabecera. Si existe, usarla.
        if (!purchaseHeader) {
            const purchaseHeaderInput = {
                idProvider: Number(idProvider),
                purchaseDate,
                category: String(category).toUpperCase(),
                invoiceNumber: invoiceNumber || null,
                receptionDate: receptionDate || null,
                observations: observations || null,
                status: 'PENDIENTE'
            };
            purchaseHeader = await RegisterPurchase.create(purchaseHeaderInput, { transaction: t });
        } else {
            await purchaseHeader.update({
                purchaseDate,
                invoiceNumber: invoiceNumber || purchaseHeader.invoiceNumber,
                observations: observations || purchaseHeader.observations,
            }, { transaction: t });
        }

        // --- INICIO DE LA MODIFICACIÓN CRÍTICA ---
        // 3. Procesar y AÑADIR los detalles.
        // Se elimina la lógica que busca un detalle existente para actualizarlo.
        // AHORA, SIEMPRE SE CREA UN NUEVO REGISTRO de PurchaseDetail por cada ítem.
        // Esto preserva el historial de cada "evento de compra" individual.
        for (const detail of details) {
            const quantity = Number(detail.quantity);
            const unitPrice = Number(detail.unitPrice);
            const supplyId = Number(detail.idSupply);

            await PurchaseDetail.create({
                idRegisterPurchase: purchaseHeader.idRegisterPurchase,
                idSupply: supplyId,
                quantity,
                unitPrice,
                subtotal: quantity * unitPrice
            }, { transaction: t });
            
            // Actualizar el lastPrice en el modelo Supply sigue siendo útil
            await Supply.update({ lastPrice: unitPrice }, { where: { idSupply: supplyId }, transaction: t });
        }
        // --- FIN DE LA MODIFICACIÓN CRÍTICA ---
        
        // 4. Recalcular los totales de la cabecera de compra.
        await recalculateAndSaveTotals(purchaseHeader.idRegisterPurchase, t);
        
        await t.commit();
        
        return registerPurchaseRepository.getRegisterPurchaseById(purchaseHeader.idRegisterPurchase);

    } catch (error) {
        await t.rollback();
        console.error("Error en servicio processFullPurchase:", error);
        throw error;
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
    const purchase = await RegisterPurchase.findByPk(id);
    if (!purchase) throw new NotFoundError(`Compra con ID ${id} no encontrada.`);
    
    const deleted = await registerPurchaseRepository.deleteRegisterPurchaseAndDetails(id);
    if (!deleted) throw new Error("La compra no pudo ser eliminada.");

    return { message: "Compra eliminada exitosamente." };
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
    const upperCategoryName = categoryName.toUpperCase();
    if (!RegisterPurchase.ALLOWED_CATEGORIES.includes(upperCategoryName)) {
        throw new BadRequestError(`Categoría '${categoryName}' no es válida.`);
    }
    return registerPurchaseRepository.getProvidersByCategory(upperCategoryName);
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