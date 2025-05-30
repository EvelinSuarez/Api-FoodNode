// middlewares/employeeValidator.js
const { body, param, validationResult: expressValidationResult } = require('express-validator');
const { Op } = require('sequelize');

// --- IMPORTACIÓN Y VERIFICACIÓN DEL MODELO ---
let EmployeeModel; // Usar un nombre diferente para evitar confusiones de scope
try {
    const db = require('../models'); // Ajusta la ruta si es necesario
    if (db && db.employee) { // Verifica el nombre que usaste en models/index.js (probablemente minúscula)
        EmployeeModel = db.employee;
        console.log("EMPLOYEE VALIDATOR: Modelo 'Employee' (db.employee) cargado CORRECTAMENTE.");
    } else if (db && db.Employee) { // Intenta con 'E' mayúscula como fallback
        EmployeeModel = db.Employee;
        console.log("EMPLOYEE VALIDATOR: Modelo 'Employee' (db.Employee) cargado CORRECTAMENTE.");
    } else {
        console.error("EMPLOYEE VALIDATOR: ERROR - 'db.employee' o 'db.Employee' NO está definido.");
        EmployeeModel = null; // Establecer a null explícitamente
    }
} catch (e) {
    console.error("EMPLOYEE VALIDATOR: ERROR CRÍTICO al importar '../models' o acceder al modelo Employee.", e);
    EmployeeModel = null;
}

if (!EmployeeModel) {
    console.error("EMPLOYEE VALIDATOR: EL MODELO 'EmployeeModel' ES NULL/UNDEFINED. Las validaciones de BD fallarán.");
}
// --- FIN DE IMPORTACIÓN Y VERIFICACIÓN ---


// --- Funciones de Validación Personalizada ---
const validateEmployeeExistence = async (idEmployeeValue, { req }) => {
    if (!EmployeeModel) return Promise.reject("Error interno: Modelo Employee no disponible.");
    if (!idEmployeeValue || isNaN(parseInt(idEmployeeValue, 10)) || parseInt(idEmployeeValue, 10) <= 0) {
        return Promise.reject('ID de empleado inválido en la URL.');
    }
    try {
        const employee = await EmployeeModel.findByPk(idEmployeeValue);
        if (!employee) {
            return Promise.reject('El empleado especificado no existe.');
        }
        req.foundEmployee = employee; // Guardar para posible uso posterior
    } catch (dbError) {
        console.error(`[validateEmployeeExistence] DB Error for ID ${idEmployeeValue}:`, dbError);
        return Promise.reject("Error al verificar existencia del empleado.");
    }
};

const validateUniqueEmployeeDocument = async (documentValue, { req }) => {
    if (!EmployeeModel) return Promise.reject("Error interno: Modelo Employee no disponible.");
    
    const typeDocumentValue = req.body.typeDocument;
    if (!documentValue || !typeDocumentValue) {
        // Si son obligatorios, notEmpty() debería haber fallado antes.
        // Si no, y no se proveen, no podemos validar unicidad compuesta.
        return; 
    }

    const employeeIdFromParams = req.params.idEmployee; // Nombre del parámetro en la ruta
    
    const whereClause = { 
        document: String(documentValue).trim(), // Convertir a String y trim
        typeDocument: typeDocumentValue 
    };

    if (employeeIdFromParams) {
        whereClause.idEmployee = { [Op.ne]: employeeIdFromParams }; // Asume PK es idEmployee
    }

    console.log("DEBUG: validateUniqueEmployeeDocument - Where Clause:", whereClause); // Para depurar
    try {
        const existingEmployee = await EmployeeModel.findOne({ where: whereClause });
        if (existingEmployee) {
            return Promise.reject(`El documento '${documentValue}' con tipo '${typeDocumentValue}' ya está registrado.`);
        }
    } catch (dbError) {
        console.error(`[validateUniqueEmployeeDocument] DB Error for document ${documentValue}:`, dbError);
        return Promise.reject("Error al verificar unicidad del documento del empleado.");
    }
};

const validateUniqueEmployeeEmail = async (emailValue, { req }) => {
    if (!EmployeeModel) return Promise.reject("Error interno: Modelo Employee no disponible.");
    if (!emailValue) return; 
    
    const employeeIdFromParams = req.params.idEmployee; // Nombre del parámetro en la ruta
    const whereClause = { email: String(emailValue).trim().toLowerCase() }; // Normalizar

    if (employeeIdFromParams) {
        whereClause.idEmployee = { [Op.ne]: employeeIdFromParams }; // Asume PK es idEmployee
    }

    console.log("DEBUG: validateUniqueEmployeeEmail - Where Clause:", whereClause); // Para depurar
    try {
        const existingEmployee = await EmployeeModel.findOne({ where: whereClause });
        if (existingEmployee) {
            return Promise.reject('Este correo electrónico ya está en uso.');
        }
    } catch (dbError) {
        console.error(`[validateUniqueEmployeeEmail] DB Error for email ${emailValue}:`, dbError);
        return Promise.reject("Error al verificar unicidad del email del empleado.");
    }
};

const TIPOS_SANGRE_VALIDOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const TIPOS_DOCUMENTOS_VALIDOS = ["CC", "CE", "PA", "PEP", "RC", "TI"];

// --- Validaciones Exportadas ---
const createEmployeeValidation = [
    // ... (tus validaciones de body, asegurándote que los nombres de campo coincidan con el frontend/modelo)
    body('fullName').notEmpty().withMessage('Nombre completo es obligatorio.').isString().trim().isLength({ min: 3, max: 60 }).matches(/^[a-zA-Z\sÁÉÍÓÚáéíóúñÑ'-]+$/),
    body('typeDocument').notEmpty().withMessage('Tipo de documento es obligatorio.').isString().trim().isIn(TIPOS_DOCUMENTOS_VALIDOS),
    body('document').notEmpty().withMessage('Documento es obligatorio.').isString().trim().isLength({ min: 5, max: 20 }).matches(/^[a-zA-Z0-9-]+$/).custom(validateUniqueEmployeeDocument),
    body('cellPhone').notEmpty().withMessage('Celular es obligatorio.').isString().trim().matches(/^\d{7,15}$/),
    body('email').notEmpty().withMessage('Correo es obligatorio.').isEmail().normalizeEmail().custom(validateUniqueEmployeeEmail),
    body('dateOfEntry').notEmpty().withMessage('Fecha de ingreso es obligatoria.').isISO8601().toDate(),
    body('Address').notEmpty().withMessage('Dirección es obligatoria.').isString().trim().isLength({ min: 5, max: 100 }),
    body('contractType').notEmpty().withMessage('Tipo de contrato es obligatorio.').isString().trim().isLength({ min: 3, max: 50 }),
    body('BloodType').notEmpty().withMessage('Tipo de sangre es obligatorio.').isString().trim().isIn(TIPOS_SANGRE_VALIDOS),
    body('socialSecurityNumber').notEmpty().withMessage('No. Seg. Social es obligatorio.').isString().trim().isLength({ min: 5, max: 20 }).matches(/^[a-zA-Z0-9-]+$/),
    body('emergencyContact').notEmpty().withMessage('Tel. emergencia es obligatorio.').isString().trim().matches(/^\d{7,15}$/),
    body('nameFamilyMember').notEmpty().withMessage('Nombre de familiar es obligatorio.').isString().trim().isLength({ min: 3, max: 60 }),
    body('Relationship').notEmpty().withMessage('Parentesco es obligatorio.').isString().trim().isLength({ min: 3, max: 50 }),
    body('status').optional().isBoolean().toBoolean(),
];

const updateEmployeeValidation = [
    param('idEmployee').isInt({ gt: 0 }).withMessage('ID de empleado inválido.').custom(validateEmployeeExistence), // Asegúrate que el param name sea 'idEmployee'
    body('fullName').optional().isString().trim().isLength({ min: 3, max: 60 }).matches(/^[a-zA-Z\sÁÉÍÓÚáéíóúñÑ'-]+$/),
    body('typeDocument').optional().isString().trim().isIn(TIPOS_DOCUMENTOS_VALIDOS),
    body('document').optional().isString().trim().isLength({ min: 5, max: 20 }).matches(/^[a-zA-Z0-9-]+$/).custom(validateUniqueEmployeeDocument),
    body('cellPhone').optional().isString().trim().matches(/^\d{7,15}$/),
    body('email').optional().isEmail().normalizeEmail().custom(validateUniqueEmployeeEmail),
    body('dateOfEntry').optional().isISO8601().toDate(),
    body('Address').optional().isString().trim().isLength({ min: 5, max: 100 }),
    body('contractType').optional().isString().trim().isLength({ min: 3, max: 50 }),
    body('BloodType').optional().isString().trim().isIn(TIPOS_SANGRE_VALIDOS),
    body('socialSecurityNumber').optional().isString().trim().isLength({ min: 5, max: 20 }).matches(/^[a-zA-Z0-9-]+$/),
    body('emergencyContact').optional().isString().trim().matches(/^\d{7,15}$/),
    body('nameFamilyMember').optional().isString().trim().isLength({ min: 3, max: 60 }),
    body('Relationship').optional().isString().trim().isLength({ min: 3, max: 50 }),
    body('status').optional().isBoolean().toBoolean(),
];

const deleteEmployeeValidation = [ param('idEmployee').isInt({ gt: 0 }).withMessage('ID inválido.').custom(validateEmployeeExistence) ];
const getEmployeeByIdValidation = [ param('idEmployee').isInt({ gt: 0 }).withMessage('ID inválido.').custom(validateEmployeeExistence) ];
const changeStateValidation = [
    param('idEmployee').isInt({ gt: 0 }).withMessage('ID inválido.').custom(validateEmployeeExistence),
    body('status').exists({checkFalsy: false}).withMessage('Estado es requerido.').isBoolean().withMessage('Estado debe ser booleano.').toBoolean(),
];

module.exports = {
    createEmployeeValidation,
    updateEmployeeValidation,
    deleteEmployeeValidation,
    getEmployeeByIdValidation,
    changeStateValidation,
    validationResult: expressValidationResult,
};