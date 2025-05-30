// repositories/registerPurchaseRepository.js
const { RegisterPurchase, PurchaseDetail, Provider, Supply, sequelize } = require('../models');

const createRegisterPurchaseWithDetails = async (purchaseHeaderData, detailsData, transaction) => {
    // ----- DEBUGGING INICIO DE REPOSITORIO -----
    // console.log("REPOSITORY createRegisterPurchaseWithDetails - purchaseHeaderData RECIBIDO:", JSON.stringify(purchaseHeaderData, null, 2));
    // console.log(`REPOSITORY createRegisterPurchaseWithDetails - idProvider: ${purchaseHeaderData.idProvider}, type: ${typeof purchaseHeaderData.idProvider}`);
    // console.log(`REPOSITORY createRegisterPurchaseWithDetails - category: ${purchaseHeaderData.category}, type: ${typeof purchaseHeaderData.category}`);
    // ----- FIN DEBUGGING -----

    // Desestructurar directamente de purchaseHeaderData
    const { 
        idProvider, 
        purchaseDate, 
        category, 
        invoiceNumber, 
        receptionDate, 
        observations, 
        status, 
        paymentStatus 
    } = purchaseHeaderData;

    // Verificación crucial antes del .create()
    if (idProvider === undefined || idProvider === null || category === undefined || category === null) {
        console.error("ERROR CRÍTICO EN REPOSITORIO: idProvider o category son nulos/undefined ANTES de RegisterPurchase.create!");
        // Esto no debería suceder si el servicio los está enviando correctamente.
        // Si sucede, indica un problema en el objeto purchaseHeaderInput del servicio.
        throw new Error("Error interno del sistema: Datos de cabecera de compra incompletos en el repositorio.");
    }

    const newPurchase = await RegisterPurchase.create({
        idProvider,     // Usar la variable idProvider desestructurada
        purchaseDate,
        category,       // Usar la variable category desestructurada
        invoiceNumber,
        receptionDate,
        observations,
        // El modelo RegisterPurchase debe tener defaults para status y paymentStatus
        // si no se proporcionan aquí y allowNull es false.
        // Si status/paymentStatus son undefined aquí, Sequelize los omitirá del INSERT,
        // permitiendo que los defaults de la DB/modelo actúen.
        // Si allowNull es false y NO hay default, entonces SÍ deben tener valor aquí.
        // Asumimos que el modelo tiene defaults:
        status: status, // (Opcional: status || 'PENDIENTE' si quieres forzarlo aquí y el modelo no tuviera default)
        paymentStatus: paymentStatus, // (Opcional: paymentStatus || 'NO_PAGADA')
    }, { transaction });

    const purchaseDetailsToCreate = detailsData.map(detail => ({
        idRegisterPurchase: newPurchase.idRegisterPurchase,
        idSupply: detail.idSupply, // 'detail.idSupply' ya fue mapeado en el servicio
        quantity: Number(detail.quantity),
        unitPrice: Number(detail.unitPrice),
    }));
    console.log("DEBUG REPO - purchaseDetailsToCreate (ANTES de bulkCreate):", JSON.stringify(purchaseDetailsToCreate, null, 2)); 

    await PurchaseDetail.bulkCreate(purchaseDetailsToCreate, {
        transaction,
        individualHooks: true 
    });

    return newPurchase;
};

// ... (getAllRegisterPurchases y el resto de funciones del repositorio como las tenías, no necesitan cambios para este error específico)
const getAllRegisterPurchases = async () => {
    // console.log("DEBUG REPO: Ejecutando getAllRegisterPurchases (sin 'attributes' explícitos para depurar)");
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
            {
                model: Provider,
                as: 'provider',
                attributes: ['idProvider', 'company', 'document', 'email', 'cellPhone', 'status']
            },
            {
                model: PurchaseDetail,
                as: 'details',
                // attributes: ['idPurchaseDetail', 'quantity', 'unitPrice', 'subtotal', 'taxAmount', 'discountAmount', 'itemTotal', 'idSupply'], // Descomentar si necesitas ser específico
                include: [{
                    model: Supply,
                    as: 'supply',
                    attributes: ['idSupply', 'supplyName', 'unitOfMeasure', 'status']
                }]
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
    const purchase = await RegisterPurchase.findByPk(idPurchase, { transaction });
    if (!purchase) {
        return false; 
    }
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