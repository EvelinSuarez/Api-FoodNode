// services/registerPurchaseService.js (BACKEND - Completo y Limpio)

const registerPurchaseRepository = require('../repositories/registerPurchaseRepository');
// Importa los modelos necesarios para la lógica de negocio y la transacción
const { RegisterPurchase, PurchaseDetail, Provider, Supplier, sequelize } = require('../models');

/**
 * Procesa el envío de una compra: Crea o actualiza según proveedor/insumo.
 * @param {object} purchaseDataFromFrontend Datos de la compra {idProvider, purchaseDate, details:[{idInsumo, quantity, unitPrice}], totalAmount}.
 * @returns {Promise<object>} Objeto { purchase: (Compra final con detalles), created: (boolean) }.
 */
const processPurchaseSubmission = async (purchaseDataFromFrontend) => {
    const { idProvider, purchaseDate, details, totalAmount: frontendTotal } = purchaseDataFromFrontend;

    // Validación básica de entrada
    if (!idProvider || !purchaseDate || !details || !Array.isArray(details) || details.length === 0) {
        throw new Error("Datos de compra incompletos o inválidos (proveedor, fecha o detalles faltantes).");
    }

    // Iniciar transacción
    const t = await sequelize.transaction();
    let purchaseIdToReturn = null;
    let transactionCommitted = false; // Bandera para el catch

    try {
        // --- Validaciones de Existencia (Proveedor e Insumos) ---
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
        // --- Fin Validaciones ---

        // 1. Buscar compra existente activa para el proveedor (ajusta el 'where' si es necesario)
        let purchase = await RegisterPurchase.findOne({
            where: { idProvider: idProvider /* , status: 'PENDIENTE' */ },
            include: [{ model: PurchaseDetail, as: 'details' }],
            transaction: t
        });

        let wasCreated = false; // Flag

        // 2. Si NO existe compra, crearla usando el repositorio
        if (!purchase) {
            wasCreated = true;
            console.log(`INFO: Creando nueva compra para proveedor ${idProvider}`);
            const newPurchaseData = { idProvider, purchaseDate, totalAmount: frontendTotal || 0, details };
            // Llama a la función 'create' del repositorio
            // Asegúrate que createRegisterPurchase en el repo acepte los datos así
            const createdPurchase = await registerPurchaseRepository.createRegisterPurchase(newPurchaseData);
            // (Asume que createRegisterPurchase NO necesita la transacción explícita aquí si usa la suya propia o si no es necesario anidarla)

            if (!createdPurchase || !createdPurchase.idRegisterPurchase) {
                 throw new Error("El repositorio no devolvió una compra válida después de crear.");
            }
            purchaseIdToReturn = createdPurchase.idRegisterPurchase;
            purchase = createdPurchase; // Guardar referencia para obtener ID

        } else {
            // 3. Si SÍ existe compra, procesar/actualizar detalles
            purchaseIdToReturn = purchase.idRegisterPurchase;
            wasCreated = false;
            console.log(`INFO: Actualizando compra existente ID: ${purchaseIdToReturn}`);

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
                if (existingDetail) { // Actualizar detalle
                    const currentQty = Number(existingDetail.quantity) || 0;
                    existingDetail.quantity = currentQty + newQuantity;
                    existingDetail.unitPrice = newUnitPrice;
                    existingDetail.subtotal = (existingDetail.quantity * existingDetail.unitPrice).toFixed(2);
                    await existingDetail.save({ transaction: t });
                } else { // Crear detalle nuevo
                    await PurchaseDetail.create({
                        idRegisterPurchase: purchase.idRegisterPurchase, idSupplier: insumoId,
                        quantity: newQuantity, unitPrice: newUnitPrice,
                        subtotal: (newQuantity * newUnitPrice).toFixed(2)
                    }, { transaction: t });
                }
            } // Fin bucle for detalles

            // Recalcular y guardar total de la cabecera
            const allFinalDetails = await PurchaseDetail.findAll({ where: { idRegisterPurchase: purchase.idRegisterPurchase }, attributes: ['subtotal'], transaction: t });
            const newTotalAmount = allFinalDetails.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);
            purchase.totalAmount = newTotalAmount.toFixed(2);
            await purchase.save({ transaction: t });
        } // Fin else (actualizar compra existente)

        // 5. Confirmar la transacción
        if (!purchaseIdToReturn) throw new Error("ID de compra inválido antes del commit.");
        console.log(`INFO: Confirmando transacción para compra ID: ${purchaseIdToReturn}`);
        await t.commit();
        transactionCommitted = true; // Marcar commit exitoso
        console.log("INFO: Transacción confirmada.");

        // 6. Devolver la compra final completa (fuera de la transacción)
        console.log(`INFO: Buscando compra final ID: ${purchaseIdToReturn}`);
        // Usa la función del repositorio que ya configuramos para incluir todo
        const finalPurchaseData = await registerPurchaseRepository.getRegisterPurchaseById(purchaseIdToReturn);

        if (!finalPurchaseData) {
            console.error(`ERROR CRÍTICO: No se pudo recuperar la compra ID ${purchaseIdToReturn} después del commit.`);
            throw new Error(`No se pudo recuperar la compra final (ID: ${purchaseIdToReturn}) después de la operación.`);
        }

        console.log(`INFO: Compra final recuperada exitosamente.`);
        return { purchase: finalPurchaseData, created: wasCreated }; // Devolver resultado

    } catch (error) {
        console.error("ERROR en servicio processPurchaseSubmission:", error.message);
        // Solo hacer rollback si NO se hizo commit y la transacción existe y está activa
        if (!transactionCommitted && t && t.finished !== 'commit' && t.finished !== 'rollback') {
             try {
                 console.warn("WARN: Error ANTES del commit, revirtiendo transacción...");
                 await t.rollback();
                 console.log("INFO: Transacción revertida.");
             } catch (rollbackError) {
                 console.error("ERROR CRÍTICO: Falla durante el rollback:", rollbackError);
             }
        } else if (transactionCommitted) {
             console.warn(`WARN: Error ocurrió DESPUÉS del commit. No se revierte.`);
        }
        // Relanza el error original para que el controlador lo maneje
        throw error;
    }
};

// --- Exportaciones del Servicio (Usando la lógica centralizada) ---
module.exports = {
    // Exporta la función principal para crear/actualizar
    processPurchaseSubmission,
    // Exporta las otras funciones que SÍ llaman directamente al repositorio
    // y no están cubiertas por la lógica de processPurchaseSubmission
    getAllRegisterPurchases: registerPurchaseRepository.getAllRegisterPurchases,
    getRegisterPurchaseById: registerPurchaseRepository.getRegisterPurchaseById,
    deleteRegisterPurchase: registerPurchaseRepository.deleteRegisterPurchase,
    changeStateRegisterPurchase: registerPurchaseRepository.changeStateRegisterPurchase,
    // updateRegisterPurchase: registerPurchaseRepository.updateRegisterPurchase, // Comentado o eliminado si ya no se necesita por separado
    // createRegisterPurchase: registerPurchaseRepository.createRegisterPurchase, // Comentado o eliminado
};