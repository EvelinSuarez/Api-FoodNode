// middlewares/providerValidator.js
const { body, param, validationResult: expressValidationResult } = require('express-validator');
const { Op } = require('sequelize');

// --- INTENTO DE IMPORTACIÓN Y VERIFICACIÓN DEL MODELO ---
let Provider;
try {
    const db = require('../models'); // Asegúrate que la ruta es correcta
    if (db && db.provider) { // Verifica que 'db' y 'db.provider' existan
        Provider = db.provider;
        console.log("PROVIDER VALIDATOR: Modelo 'Provider' cargado CORRECTAMENTE desde db.provider.");
    } else if (db && db.Provider) { // Intenta con 'P' mayúscula como fallback
        Provider = db.Provider;
        console.log("PROVIDER VALIDATOR: Modelo 'Provider' cargado CORRECTAMENTE desde db.Provider (con P mayúscula).");
    }
    else {
        console.error("PROVIDER VALIDATOR: ERROR - 'db' o 'db.provider' (o 'db.Provider') NO está definido. Verifica tu models/index.js y el nombre del modelo.");
        // Si Provider sigue undefined aquí, las validaciones que lo usen fallarán.
        // Podrías incluso lanzar un error aquí para detener la carga del servidor si es crítico.
        // throw new Error("Modelo Provider no pudo ser cargado en providerValidator.");
    }
} catch (e) {
    console.error("PROVIDER VALIDATOR: ERROR CRÍTICO al intentar importar '../models' o acceder a db.provider.", e);
    // Esto podría indicar un problema en models/index.js o una dependencia circular.
}

if (!Provider) {
    console.error("PROVIDER VALIDATOR: EL MODELO 'Provider' ES UNDEFINED DESPUÉS DEL INTENTO DE CARGA. LAS VALIDACIONES FALLARÁN.");
    // Aquí, cualquier llamada a Provider.findOne dará el error que estás viendo.
    // Para evitar que el servidor crashee completamente en cada petición,
    // podríamos asignar una función no-op o algo que devuelva un error controlado,
    // pero es mejor arreglar la carga.
}
// --- FIN DE IMPORTACIÓN Y VERIFICACIÓN ---


// --- Funciones de Validación Personalizada ---
const validateProviderExistence = async (idProviderValue, { req }) => {
    if (!Provider) return Promise.reject("Error interno: Modelo Provider no disponible para validación.");
    if (!idProviderValue || isNaN(parseInt(idProviderValue, 10)) || parseInt(idProviderValue, 10) <= 0) {
      return Promise.reject('ID de proveedor inválido en la URL.');
    }
    try {
        const provider = await Provider.findByPk(idProviderValue);
        if (!provider) {
            return Promise.reject('El proveedor especificado no existe.');
        }
    } catch (dbError) {
        console.error("Error de DB en validateProviderExistence:", dbError);
        return Promise.reject("Error al verificar existencia del proveedor.");
    }
};

const validateUniqueProviderDocument = async (document, { req }) => {
    if (!Provider) return Promise.reject("Error interno: Modelo Provider no disponible para validación.");
    const documentType = req.body.documentType;
    if (!document || !documentType) {
        return; 
    }
    const providerIdFromParams = req.params.idProvider;
    const whereClause = { 
        document: document.trim(),
        documentType: documentType 
    };
    if (providerIdFromParams) {
        whereClause.idProvider = { [Op.ne]: providerIdFromParams };
    }
    try {
        const existingProvider = await Provider.findOne({ where: whereClause });
        if (existingProvider) {
            return Promise.reject(`El documento '${document}' con tipo '${documentType}' ya está registrado.`);
        }
    } catch (dbError) {
        console.error("Error de DB en validateUniqueProviderDocument:", dbError);
        return Promise.reject("Error al verificar unicidad del documento.");
    }
};

// --- Validaciones Exportadas ---
const createProviderValidation = [
    body('company')
        .notEmpty().withMessage('El nombre de la empresa es obligatorio.')
        .isString().withMessage('Nombre empresa debe ser texto.')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Nombre empresa debe tener entre 3 y 50 caracteres.'),
    body('documentType')
        .notEmpty().withMessage('El tipo de documento es obligatorio.')
        .isString().withMessage('Tipo de documento debe ser texto.')
        .trim()
        .isIn(['CC', 'CE', 'PA', 'PEP', 'NIT']).withMessage('Tipo de documento inválido.'),
    body('document')
        .notEmpty().withMessage('El número de documento es obligatorio.')
        .isString().withMessage('Documento debe ser texto.')
        .trim()
        .custom((value, { req }) => {
            if (!req.body.documentType) throw new Error('Tipo de documento es requerido para validar el formato del documento.'); // Asegurar que documentType esté presente
            if (req.body.documentType === "NIT") {
                if (!/^\d{9,11}(?:-\d{1})?$/.test(value)) {
                    throw new Error('NIT inválido (9-11 dígitos, opcionalmente con guion y dígito verificador).');
                }
            } else {
                if (!/^[a-zA-Z0-9-]{3,20}$/.test(value)) {
                    throw new Error('Documento inválido (3-20 alfanuméricos y guiones).');
                }
            }
            return true;
        })
        .custom(validateUniqueProviderDocument),
    body('cellPhone')
        .notEmpty().withMessage('El teléfono/celular es obligatorio.')
        .isString().withMessage('Teléfono/celular debe ser texto.')
        .trim()
        .matches(/^\d{7,15}$/).withMessage('Teléfono/celular debe tener entre 7 y 15 dígitos.'),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Formato de correo electrónico inválido.')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Correo electrónico demasiado largo.'),
    body('address')
        .optional({ checkFalsy: true })
        .isString().withMessage('Dirección debe ser texto.')
        .trim()
        .isLength({ max: 100 }).withMessage('Dirección no debe exceder los 100 caracteres.'),
    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
        .toBoolean(),
];

const updateProviderValidation = [
    param('idProvider')
        .isInt({ gt: 0 }).withMessage('ID de proveedor en URL inválido.')
        .custom(validateProviderExistence),
    body('company').optional().isString().trim().isLength({ min: 3, max: 50 }),
    body('documentType').optional().isString().trim().isIn(['CC', 'CE', 'PA', 'PEP', 'NIT']),
    body('document').optional().isString().trim()
        .custom((value, { req }) => {
            // Solo validar formato si se envía el documento. Si se envía, documentType también debería estar o ser el original.
            const docType = req.body.documentType || (req.foundProvider ? req.foundProvider.documentType : null); // Asume que foundProvider se adjunta en validateProviderExistence
            if (value && !docType) throw new Error('Tipo de documento es requerido si se actualiza el documento.');
            if (value && docType === "NIT") {
                if (!/^\d{9,11}(?:-\d{1})?$/.test(value)) throw new Error('NIT inválido.');
            } else if (value) {
                if (!/^[a-zA-Z0-9-]{3,20}$/.test(value)) throw new Error('Documento inválido.');
            }
            return true;
        })
        .custom(validateUniqueProviderDocument),
    body('cellPhone').optional().isString().trim().matches(/^\d{7,15}$/),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().isLength({ max: 255 }),
    body('address').optional({ checkFalsy: true }).isString().trim().isLength({ max: 100 }),
    body('status').optional().isBoolean().toBoolean(),
];

const deleteProviderValidation = [
    param('idProvider').isInt({ gt: 0 }).withMessage('ID de proveedor en URL inválido.').custom(validateProviderExistence),
];

const getProviderByIdValidation = [
    param('idProvider').isInt({ gt: 0 }).withMessage('ID de proveedor en URL inválido.').custom(validateProviderExistence),
];

const changeStateValidation = [
    param('idProvider').isInt({ gt: 0 }).withMessage('ID de proveedor en URL inválido.').custom(validateProviderExistence),
    body('status')
        .exists({ checkFalsy: false }).withMessage('El estado es requerido (true o false).')
        .isBoolean().withMessage('El estado debe ser un valor booleano.')
        .toBoolean(),
];

module.exports = {
    createProviderValidation,
    updateProviderValidation,
    deleteProviderValidation,
    getProviderByIdValidation,
    changeStateValidation,
    validationResult: expressValidationResult,
};