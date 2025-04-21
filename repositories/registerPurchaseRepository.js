// repositories/registerPurchaseRepository.js
// *** ASEGÚRATE DE IMPORTAR TODOS LOS MODELOS NECESARIOS DESDE TU INDEX ***
const { RegisterPurchase, PurchaseDetail, Provider, Supplier, sequelize } = require('../models');

// --- CREAR COMPRA (CON DETALLES ANIDADOS) ---
const createRegisterPurchase = async (registerPurchaseData) => {
    // Usar transacción para asegurar atomicidad
    const t = await sequelize.transaction();
    try {
        const { idProvider, purchaseDate, totalAmount, details } = registerPurchaseData;

        // Validaciones de existencia (opcional pero recomendado aquí)
        const providerExists = await Provider.findByPk(idProvider, { transaction: t });
        if (!providerExists) {
            throw new Error(`Proveedor con ID ${idProvider} no encontrado.`);
        }

        if (!details || !Array.isArray(details) || details.length === 0) {
             throw new Error('No se proporcionaron detalles válidos para la compra.');
        }

        // Validar existencia de todos los insumos en los detalles
        const insumoIds = details.map(d => d.idInsumo); // Asume 'idInsumo' viene del frontend
        const existingInsumos = await Supplier.findAll({
            where: { idSupplier: insumoIds }, // Busca por PK de Supplier ('idSupplier')
            attributes: ['idSupplier'],
            transaction: t
        });
        if (existingInsumos.length !== insumoIds.length) {
            const existingIdsSet = new Set(existingInsumos.map(i => i.idSupplier));
            const missingId = insumoIds.find(id => !existingIdsSet.has(parseInt(id))); // Parsea a int si IDs son números
            throw new Error(`Insumo con ID ${missingId || 'desconocido'} no encontrado.`);
        }
        // -- Fin Validaciones --

        // Crear el registro de compra principal y sus detalles asociados
        const newPurchase = await RegisterPurchase.create({
            idProvider: idProvider,
            purchaseDate: purchaseDate,
            totalAmount: Number(totalAmount) || 0, // Asegura que sea número
            status: 'PENDIENTE', // O el estado inicial por defecto que definas
            // Mapea los detalles del frontend a la estructura del modelo PurchaseDetail
            details: details.map(detail => ({
                // *** ¡CLAVE! Mapeo Frontend -> Backend ***
                // Campo FK en PurchaseDetail: idSupplier (para el insumo)
                // Campo que viene del Frontend: idInsumo
                idSupplier: detail.idInsumo,
                quantity: Number(detail.quantity), // Asegura número
                unitPrice: Number(detail.unitPrice), // Asegura número
                // Calcula subtotal en backend
                subtotal: (Number(detail.quantity || 0) * Number(detail.unitPrice || 0)).toFixed(2) // Calcula y redondea a 2 decimales
            }))
        }, {
            // *** ¡LA OPCIÓN CRUCIAL PARA CREACIÓN ANIDADA! ***
            include: [{
                model: PurchaseDetail,
                as: 'details' // Alias de la asociación RegisterPurchase.hasMany(PurchaseDetail)
            }],
            transaction: t // Ejecutar dentro de la transacción
        });

        // Si todo va bien, confirma la transacción
        await t.commit();
        // Devolver la compra creada (Sequelize incluye los detalles anidados automáticamente)
        return newPurchase;

    } catch (error) {
        // Si algo falla, revierte la transacción
        await t.rollback();
        console.error("Error detallado en repositorio createRegisterPurchase:", error);
        // Lanza el error para que la capa de servicio/controlador lo maneje
        throw new Error(`Error en base de datos al crear la compra: ${error.message}`);
    }
};

// --- OBTENER TODAS LAS COMPRAS (CON RELACIONES) ---
const getAllRegisterPurchases = async () => {
    // Incluye Proveedor y Detalles (con sus Insumos) para el frontend
    return RegisterPurchase.findAll({
        include: [
            {
                model: Provider,
                as: 'provider', // Alias de RegisterPurchase.belongsTo(Provider)
                attributes: ['idProvider', 'company'] // Selecciona solo campos necesarios
            },
            {
                model: PurchaseDetail,
                as: 'details', // Alias de RegisterPurchase.hasMany(PurchaseDetail)
                attributes: ['idPurchaseDetail', 'quantity', 'unitPrice', 'subtotal'], // Campos del detalle
                include: [{ // Incluir el Insumo asociado a cada detalle
                    model: Supplier,
                    as: 'insumo', // Alias de PurchaseDetail.belongsTo(Supplier)
                    attributes: ['idSupplier', 'supplierName', 'measurementUnit'] // Campos necesarios del insumo
                }]
            }
        ],
        order: [['purchaseDate', 'DESC'], ['idRegisterPurchase', 'DESC']] // Ordenar resultados
    });
};

// --- OBTENER UNA COMPRA POR ID (CON RELACIONES) ---
const getRegisterPurchaseById = async (idPurchase) => {
    // Usa la PK correcta ('idRegisterPurchase')
    return RegisterPurchase.findByPk(idPurchase, {
        include: [ // Incluye las mismas relaciones que en getAll
            {
                model: Provider,
                as: 'provider',
                attributes: ['idProvider', 'company']
            },
            {
                model: PurchaseDetail,
                as: 'details',
                attributes: ['idPurchaseDetail', 'quantity', 'unitPrice', 'subtotal'],
                include: [{
                    model: Supplier,
                    as: 'insumo',
                    attributes: ['idSupplier', 'supplierName', 'measurementUnit']
                }]
            }
        ]
    });
};

// --- ACTUALIZAR COMPRA (Simplificado - Solo campos principales) ---
const updateRegisterPurchase = async (idPurchase, registerPurchaseData) => {
    // La actualización anidada de detalles requiere lógica adicional (delete/create o find/update/create)
    // Esta versión solo actualiza campos directos de RegisterPurchase
    // Asegúrate de que la PK se llama 'idRegisterPurchase' en el modelo
    const { details, idProvider, ...simpleUpdates } = registerPurchaseData; // Excluir detalles y FKs que no se actualizan directamente aquí

    const [numberOfAffectedRows] = await RegisterPurchase.update(simpleUpdates, {
        where: { idRegisterPurchase: idPurchase } // Usa la PK correcta
    });
    return numberOfAffectedRows > 0; // Devuelve true si se actualizó al menos una fila
};

// --- ELIMINAR COMPRA ---
const deleteRegisterPurchase = async (idPurchase) => {
    // Usa la PK correcta ('idRegisterPurchase')
    const numberOfDeletedRows = await RegisterPurchase.destroy({
        where: { idRegisterPurchase: idPurchase }
    });
    return numberOfDeletedRows > 0; // Devuelve true si se eliminó al menos una fila
};

// --- CAMBIAR ESTADO DE COMPRA ---
const changeStateRegisterPurchase = async (idPurchase, status) => {
    // Usa la PK correcta ('idRegisterPurchase')
    const [numberOfAffectedRows] = await RegisterPurchase.update({ status }, { // Asegura que 'status' sea el campo correcto
        where: { idRegisterPurchase: idPurchase }
    });
    return numberOfAffectedRows > 0; // Devuelve true si se actualizó al menos una fila
}

// Exportar las funciones del repositorio
module.exports = {
    createRegisterPurchase,
    getAllRegisterPurchases,
    getRegisterPurchaseById,
    updateRegisterPurchase,
    deleteRegisterPurchase,
    changeStateRegisterPurchase,
};