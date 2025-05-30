// services/registerPurchaseService.js (Backend)
const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');
const { RegisterPurchase, Provider, Supply, sequelize, PurchaseDetail } = require('../models');
const { Op } = require('sequelize'); // <--- AÑADE O ASEGÚRATE DE ESTA LÍNEA

const processFullPurchase = async (purchaseDataFromFrontend) => {
    const {
        idProvider,
        purchaseDate,
        category,
        invoiceNumber,
        receptionDate,
        observations,
        status,
        paymentStatus,
        details // Esto vendrá con objetos que tienen { idSupply, quantity, unitPrice }
    } = purchaseDataFromFrontend;

    // 1. Validar Proveedor
    if (idProvider === undefined || idProvider === null) {
        throw Object.assign(new Error(`El idProvider es obligatorio.`), { statusCode: 400 });
    }
    const providerExists = await Provider.findByPk(idProvider);
    if (!providerExists) {
        throw Object.assign(new Error(`Proveedor con ID ${idProvider} no encontrado.`), { statusCode: 404 });
    }
    if (!providerExists.status) {
        throw Object.assign(new Error(`El proveedor '${providerExists.company}' (ID: ${idProvider}) no está activo.`), { statusCode: 400 });
    }

    // 2. Validar Categoría
    if (category === undefined || category === null || String(category).trim() === '') {
        throw Object.assign(new Error(`La categoría es obligatoria.`), { statusCode: 400 });
    }
    if (!RegisterPurchase.ALLOWED_CATEGORIES.includes(String(category).toUpperCase())) {
         throw Object.assign(new Error(`Categoría '${category}' no es válida. Permitidas: ${RegisterPurchase.ALLOWED_CATEGORIES.join(', ')}`), { statusCode: 400 });
    }

    // 3. Validar Insumos (Supplies)
    if (!details || !Array.isArray(details) || details.length === 0) {
        throw Object.assign(new Error("Se requiere al menos un detalle de compra."), { statusCode: 400 });
    }

    // Leer idSupply de cada detalle
    const supplyIdsFromFrontend = details.map(d => Number(d.idSupply)).filter(id => !isNaN(id) && id > 0);

    if (supplyIdsFromFrontend.length !== details.length || supplyIdsFromFrontend.some(id => id <= 0)) {
        throw Object.assign(new Error("ID de insumo (idSupply) inválido o faltante en uno de los detalles."), { statusCode: 400 });
    }
    
    if (!Supply || typeof Supply.findAll !== 'function') {
        console.error("ERROR CRÍTICO EN SERVICE: Modelo Supply no es una función o es undefined.");
        throw Object.assign(new Error("Error interno del servidor al procesar insumos."), { statusCode: 500 });
    }

    // Validar existencia y estado de todos los insumos de una vez (más eficiente)
    const existingAndActiveSupplies = await Supply.findAll({
        where: {
            idSupply: { [Op.in]: supplyIdsFromFrontend },
            status: true
        }
    });

    if (existingAndActiveSupplies.length !== supplyIdsFromFrontend.length) {
        const foundActiveIds = existingAndActiveSupplies.map(s => s.idSupply);
        const missingOrInactiveIds = supplyIdsFromFrontend.filter(id => !foundActiveIds.includes(id));
        throw Object.assign(new Error(`Los siguientes insumos no existen o no están activos: ${missingOrInactiveIds.join(', ')}.`), { statusCode: 400 });
    }
    
    const t = await sequelize.transaction();
    try {
        const purchaseHeaderInput = {
            idProvider: Number(idProvider),
            purchaseDate,
            category: String(category).toUpperCase(),
            invoiceNumber: invoiceNumber !== null && invoiceNumber !== undefined ? String(invoiceNumber) : null,
            receptionDate: receptionDate !== null && receptionDate !== undefined ? receptionDate : null,
            observations: observations !== null && observations !== undefined ? String(observations) : null,
            ...(status !== undefined && { status: String(status) }),
            ...(paymentStatus !== undefined && { paymentStatus: String(paymentStatus) })
        };

        // ---------- LA CORRECCIÓN ESTÁ AQUÍ ----------
        const detailsForRepository = details.map(d => ({
            idSupply: Number(d.idSupply),   // <<< DEBE SER d.idSupply
            quantity: Number(d.quantity),
            unitPrice: Number(d.unitPrice),
        }));
        // --------------------------------------------

        // console.log("SERVICE processFullPurchase - detailsForRepository:", JSON.stringify(detailsForRepository, null, 2)); // DEBUG

        const createdPurchaseHeader = await registerPurchaseRepository.createRegisterPurchaseWithDetails(
            purchaseHeaderInput,
            detailsForRepository,
            t
        );
        
        await recalculateAndSaveTotals(createdPurchaseHeader.idRegisterPurchase, t);
        await t.commit();
        
        return registerPurchaseRepository.getRegisterPurchaseById(createdPurchaseHeader.idRegisterPurchase);

    } catch (error) {
        await t.rollback();
        console.error("Error en servicio processFullPurchase (transacción):", error.message, error.stack);
        if (error.name && error.name.startsWith('Sequelize') && !error.statusCode) {
            const messages = error.errors ? error.errors.map(e => `${e.path || 'Campo'} ${e.message.replace(e.path || '', '').trim()}`).join('; ') : error.message;
            throw Object.assign(new Error(`Error de base de datos: ${messages}`), { statusCode: 400 });
        }
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error interno del servidor al procesar la compra.";
        throw Object.assign(new Error(message), { statusCode });
    }
};

const recalculateAndSaveTotals = async (purchaseId, transaction) => {
    const purchaseInstance = await RegisterPurchase.findByPk(purchaseId, {
        include: [{ model: PurchaseDetail, as: 'details' }], // Asegúrate que el alias 'details' es correcto
        transaction
    });

    if (!purchaseInstance) {
        console.warn(`WARN: Compra con ID ${purchaseId} no encontrada para recalcular totales.`);
        return; 
    }

    let calculatedSubtotal = 0;
    if (purchaseInstance.details && purchaseInstance.details.length > 0) {
        calculatedSubtotal = purchaseInstance.details.reduce((sum, detail) => {
            // El subtotal del detalle ya debería estar calculado por el hook de PurchaseDetail
            const detailSubtotal = parseFloat(detail.subtotal);
            return sum + (isNaN(detailSubtotal) ? 0 : detailSubtotal);
        }, 0);
    }
    
    // Asumiendo que no hay impuestos/descuentos a nivel de cabecera de compra por ahora
    const calculatedTotal = calculatedSubtotal;

    await purchaseInstance.update({
        subtotalAmount: calculatedSubtotal.toFixed(2),
        totalAmount: calculatedTotal.toFixed(2)
    }, {
        transaction
    });
};

const getAll = async () => {
    // Asegúrate que el repositorio incluya Provider y Details (con Supply)
    return registerPurchaseRepository.getAllRegisterPurchases();
};

const getById = async (id) => {
    const purchase = await registerPurchaseRepository.getRegisterPurchaseById(id);
    if (!purchase) {
        throw Object.assign(new Error(`Compra con ID ${id} no encontrada.`), { statusCode: 404 });
    }
    return purchase;
};

const updateHeader = async (idPurchase, headerDataToUpdate) => {
    const purchase = await RegisterPurchase.findByPk(idPurchase);
    if (!purchase) {
        throw Object.assign(new Error(`Compra con ID ${idPurchase} no encontrada para actualizar.`), { statusCode: 404 });
    }

    const allowedFields = ['purchaseDate', 'category', 'invoiceNumber', 'receptionDate', 'observations', 'status', 'paymentStatus', 'idProvider'];
    const validData = {};

    for (const key of allowedFields) {
        if (headerDataToUpdate.hasOwnProperty(key) && headerDataToUpdate[key] !== undefined) {
            if (key === 'idProvider') {
                const providerId = parseInt(headerDataToUpdate.idProvider, 10);
                 // Solo actualizar si el idProvider es diferente y válido
                if (purchase.idProvider !== providerId) {
                    if (isNaN(providerId) || providerId <= 0) {
                         throw Object.assign(new Error(`El ID del proveedor proporcionado no es válido.`), { statusCode: 400 });
                    }
                    const newProvider = await Provider.findByPk(providerId);
                    if (!newProvider) throw Object.assign(new Error(`Proveedor con ID ${providerId} no encontrado.`), { statusCode: 404 });
                    if (!newProvider.status) throw Object.assign(new Error(`El proveedor '${newProvider.company}' (ID: ${providerId}) no está activo.`), { statusCode: 400 });
                    validData.idProvider = providerId;
                }
            } else if (key === 'category') {
                const categoryValue = String(headerDataToUpdate[key]).toUpperCase();
                if (!RegisterPurchase.ALLOWED_CATEGORIES.includes(categoryValue)) {
                    throw Object.assign(new Error(`Categoría '${headerDataToUpdate[key]}' no es válida.`), { statusCode: 400 });
                }
                validData[key] = categoryValue;
            } else { // Para los demás campos permitidos
                validData[key] = headerDataToUpdate[key];
            }
        }
    }

    if (Object.keys(validData).length === 0) {
        throw Object.assign(new Error("No se proporcionaron datos válidos para actualizar la cabecera de la compra."), { statusCode: 400 });
    }
    
    const t = await sequelize.transaction();
    try {
        await registerPurchaseRepository.updateRegisterPurchaseHeader(idPurchase, validData, t);
        // No es necesario recalcular totales si solo se actualiza la cabecera
        // a menos que la actualización de la cabecera pueda afectar los detalles (no es común).
        await t.commit();
        return registerPurchaseRepository.getRegisterPurchaseById(idPurchase);
    } catch (error) {
        await t.rollback();
        console.error("Error en servicio updateHeader:", error.message, error.stack);
         if (error.name && error.name.startsWith('Sequelize') && !error.statusCode) {
            const messages = error.errors ? error.errors.map(e => `${e.path || 'Campo'} ${e.message.replace(e.path || '', '').trim()}`).join('; ') : error.message;
            throw Object.assign(new Error(`Error de base de datos: ${messages}`), { statusCode: 400 });
        }
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error interno del servidor al actualizar la cabecera.";
        throw Object.assign(new Error(message), { statusCode });
    }
};

const deleteById = async (id) => {
    const purchase = await RegisterPurchase.findByPk(id);
    if (!purchase) {
        throw Object.assign(new Error(`Compra con ID ${id} no encontrada para eliminar.`), { statusCode: 404 });
    }

    const t = await sequelize.transaction();
    try {
        const deleted = await registerPurchaseRepository.deleteRegisterPurchaseAndDetails(id, t);
        if (!deleted) { 
            throw Object.assign(new Error("No se pudo eliminar la compra."), { statusCode: 404 }); // Mensaje más genérico
        }
        await t.commit();
        return { message: "Compra eliminada exitosamente." };
    } catch (error) {
        await t.rollback();
        console.error("Error en servicio deleteById:", error.message, error.stack);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error interno del servidor al eliminar la compra.";
        throw Object.assign(new Error(message), { statusCode });
    }
};

const updatePurchaseStatus = async (idPurchase, { status, paymentStatus }) => {
    const purchase = await RegisterPurchase.findByPk(idPurchase);
    if (!purchase) {
      throw Object.assign(new Error(`Compra con ID ${idPurchase} no encontrada.`), { statusCode: 404 });
    }
  
    const fieldsToUpdate = {};
    // Usar los valores ENUM definidos en el modelo para la validación
    const validStatuses = RegisterPurchase.getAttributes().status.values;
    const validPaymentStatuses = RegisterPurchase.getAttributes().paymentStatus.values;

    if (status !== undefined) {
        if (!validStatuses.includes(status.toUpperCase())) { // Convertir a mayúsculas para comparar con ENUMs
             throw Object.assign(new Error(`Valor de estado '${status}' no es válido. Válidos: ${validStatuses.join(', ')}`), { statusCode: 400 });
        }
        fieldsToUpdate.status = status.toUpperCase();
    }
    if (paymentStatus !== undefined) {
         if (!validPaymentStatuses.includes(paymentStatus.toUpperCase())) {
             throw Object.assign(new Error(`Valor de estado de pago '${paymentStatus}' no es válido. Válidos: ${validPaymentStatuses.join(', ')}`), { statusCode: 400 });
        }
        fieldsToUpdate.paymentStatus = paymentStatus.toUpperCase();
    }
  
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw Object.assign(new Error('No se especificó ningún estado (status o paymentStatus) para actualizar.'), { statusCode: 400 });
    }
      
    const t = await sequelize.transaction();
    try {
        await registerPurchaseRepository.updateStatus(idPurchase, fieldsToUpdate, t);
        await t.commit();
        return registerPurchaseRepository.getRegisterPurchaseById(idPurchase);
    } catch (error) {
        await t.rollback();
        console.error("Error en servicio updatePurchaseStatus:", error.message, error.stack);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error interno del servidor al actualizar estado de compra.";
        throw Object.assign(new Error(message), { statusCode });
    }
};

const getProvidersByCategory = async (categoryName) => {
    const upperCategoryName = categoryName.toUpperCase();
    if (!RegisterPurchase.ALLOWED_CATEGORIES.includes(upperCategoryName)) {
        throw Object.assign(new Error(`Categoría '${categoryName}' no es válida.`), { statusCode: 400 });
    }
    // Asumiendo que el repositorio se encarga de filtrar proveedores por categoría.
    // Si necesitas una lógica más compleja (ej. proveedores que ofrecen insumos de esa categoría),
    // se haría aquí o en el repositorio.
    return registerPurchaseRepository.getProvidersByCategory(upperCategoryName);
};

module.exports = {
    processFullPurchase,
    getAll,
    getById,
    updateHeader,
    deleteById,
    updatePurchaseStatus,
    getProvidersByCategory,
};