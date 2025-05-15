// repositories/processDetailRepository.js

// --- IMPORTANTE: Importar modelos desde tu archivo index.js de modelos ---
// Esto asegura que obtienes los modelos con sus asociaciones ya definidas.
const {
    ProcessDetail,
    Process,
    SpecSheet,
    Employee,
    ProductionOrder // Necesitarás ProductionOrder si lo incluyes en alguna consulta
} = require('../models/processDetail');
require('../models/process');
require('../models/specSheet');
require('../models/employee');
require('../models/productionOrder'); // Ajusta la ruta a tu carpeta 'models' (que contiene index.js)

// --- Métodos del Repositorio ---

const createProcessDetail = async (processDetailData) => {
    // 'processDetailData' ahora DEBE incluir idProductionOrder, idProcess, idSpecSheet, idEmployee, etc.
    if (!processDetailData.idProductionOrder || !processDetailData.idProcess || !processDetailData.idSpecSheet) {
        // Considera si idEmployee es estrictamente requerido al crear, o puede ser null/undefined
        throw new Error("idProductionOrder, idProcess, y idSpecSheet son requeridos para crear el detalle del proceso.");
    }
    // Si status o startDate no vienen, el modelo debería tener defaultValues o permitir null
    return ProcessDetail.create(processDetailData);
};

const getAllProcessDetails = async () => {
    return ProcessDetail.findAll({
        include: [
            { model: ProductionOrder, as: 'productionOrder' }, // Incluir la orden de producción
            { model: Process, as: 'masterProcess' }, // Usar alias si los definiste
            { model: SpecSheet, as: 'specSheet' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

const getProcessDetailById = async (idProcessDetail) => {
    return ProcessDetail.findByPk(idProcessDetail, {
        include: [
            { model: ProductionOrder, as: 'productionOrder' },
            { model: Process, as: 'masterProcess' },
            { model: SpecSheet, as: 'specSheet' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

// ----- NUEVO MÉTODO -----
const getProcessDetailsByProductionOrder = async (idProductionOrder) => {
    if (!idProductionOrder) {
        // Podrías devolver un array vacío o lanzar un error si el ID no es válido
        console.warn("getProcessDetailsByProductionOrder llamado sin idProductionOrder");
        return [];
    }
    return ProcessDetail.findAll({
        where: { idProductionOrder: idProductionOrder },
        include: [
            { model: Process, as: 'masterProcess' }, // Para obtener el nombre del proceso, etc.
            { model: Employee, as: 'assignedEmployee' }  // Para obtener el nombre del empleado
            // No necesitas SpecSheet o ProductionOrder aquí porque ya estás filtrando por ellas
            // o ya tienes esa info desde la consulta de la orden principal.
        ],
        order: [
            // Si quieres ordenar por el 'processOrder' de la ficha técnica,
            // y 'processOrder' no está en ProcessDetail, la ordenación es más compleja.
            // Podrías incluir el modelo Process y ordenar por un campo de Process si tiene orden.
            // O, si ProcessDetail tiene una columna 'stepOrder' o similar:
            // ['stepOrder', 'ASC'],
            ['createdAt', 'ASC'] // Orden de creación como fallback
        ]
    });
};
// ----- FIN NUEVO MÉTODO -----

const updateProcessDetail = async (idProcessDetail, processDetailDataToUpdate) => {
    // 'processDetailDataToUpdate' puede contener idEmployee, startDate, endDate, status, etc.
    // No debería intentar actualizar idProductionOrder, idProcess, o idSpecSheet una vez creado.
    const detail = await ProcessDetail.findByPk(idProcessDetail);
    if (!detail) {
        throw new Error(`Detalle de proceso con ID ${idProcessDetail} no encontrado para actualizar.`);
    }

    // Lógica para endDate si status cambia a 'COMPLETED' (o tu valor para completado)
    if (processDetailDataToUpdate.status === 'COMPLETED' && !detail.endDate && !processDetailDataToUpdate.endDate) {
        processDetailDataToUpdate.endDate = new Date();
    } else if (processDetailDataToUpdate.status !== 'COMPLETED' && processDetailDataToUpdate.status !== detail.status) {
        // Si se cambia de COMPLETED a otro estado, limpiar endDate (si esa es tu lógica)
        // O si status se pone en PENDING/IN_PROGRESS, endDate debería ser null
        if (processDetailDataToUpdate.status === 'PENDING' || processDetailDataToUpdate.status === 'IN_PROGRESS') {
             processDetailDataToUpdate.endDate = null;
        }
    }


    // Sequelize update() devuelve un array con [count, rows] donde count es el número de filas afectadas.
    // Para obtener el objeto actualizado, es mejor usar instance.update() o findByPk luego save().
    // Aquí usamos instance.update()
    return detail.update(processDetailDataToUpdate);
};

const deleteProcessDetail = async (idProcessDetail) => {
    const result = await ProcessDetail.destroy({
        where: { idProcessDetail }
    });
    if (result === 0) {
        throw new Error(`Detalle de proceso con ID ${idProcessDetail} no encontrado para eliminar.`);
    }
    return result; // Número de filas eliminadas
};

const changeStateProcessDetail = async (idProcessDetail, newStatus) => {
    // Este método es un caso específico de updateProcessDetail.
    // Puedes mantenerlo o fusionarlo con la lógica de updateProcessDetail.
    const dataToUpdate = { status: newStatus };
    if (newStatus === 'COMPLETED') { // Asumiendo que 'COMPLETED' es tu string para completado
        dataToUpdate.endDate = new Date();
    } else if (newStatus === 'PENDING' || newStatus === 'IN_PROGRESS') {
        dataToUpdate.endDate = null;
    }
    // Podrías añadir más lógica aquí si es necesario

    const [affectedRows] = await ProcessDetail.update(dataToUpdate, {
        where: { idProcessDetail }
    });
    if (affectedRows === 0) {
         throw new Error(`Detalle de proceso con ID ${idProcessDetail} no encontrado o estado ya era el mismo.`);
    }
    return { affectedRows }; // O podrías devolver el objeto actualizado haciendo un findByPk después
};

// Métodos existentes (revisar si los 'include' necesitan 'as' y el modelo ProductionOrder)
const getProcessDetailsByProcess = async (idProcess) => {
    return ProcessDetail.findAll({
        where: { idProcess },
        include: [
            { model: ProductionOrder, as: 'productionOrder' },
            { model: SpecSheet, as: 'specSheet' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

const getProcessDetailsBySpecSheet = async (idSpecSheet) => {
    return ProcessDetail.findAll({
        where: { idSpecSheet },
        include: [
            { model: ProductionOrder, as: 'productionOrder' },
            { model: Process, as: 'masterProcess' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

const getProcessDetailsByEmployee = async (idEmployee) => {
    return ProcessDetail.findAll({
        where: { idEmployee },
        include: [
            { model: ProductionOrder, as: 'productionOrder' },
            { model: Process, as: 'masterProcess' },
            { model: SpecSheet, as: 'specSheet' }
        ]
    });
};

const getActiveProcessDetails = async () => {
    return ProcessDetail.findAll({
        where: {
            status: 'IN_PROGRESS', // Asumiendo que 'IN_PROGRESS' es un estado activo
            // endDate: null // Si 'IN_PROGRESS' implica que no ha terminado
        },
        include: [
            { model: ProductionOrder, as: 'productionOrder' },
            { model: Process, as: 'masterProcess' },
            { model: SpecSheet, as: 'specSheet' },
            { model: Employee, as: 'assignedEmployee' }
        ]
    });
};

module.exports = {
    createProcessDetail,
    getAllProcessDetails,
    getProcessDetailById,
    getProcessDetailsByProductionOrder, // <--- MÉTODO NUEVO Y ESENCIAL
    updateProcessDetail,
    deleteProcessDetail,
    changeStateProcessDetail, // Considera si este es realmente necesario o se fusiona con update
    getProcessDetailsByProcess,
    getProcessDetailsBySpecSheet,
    getProcessDetailsByEmployee,
    getActiveProcessDetails
};