// src/validators/userValidator.js (o donde tengas este archivo)

const { body, param, validationResult } = require('express-validator');
const User = require('../models/user'); // Asegúrate que la ruta al modelo es correcta
const Role = require('../models/role'); // Necesario para validar idRole si lo haces

// --- Funciones de Validación Personalizada (Mantenidas como estaban) ---
const validateUserExistence = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        return Promise.reject('El usuario no existe');
    }
};

const validateUniqueUserDocument = async (document, { req }) => {
    // Al editar, permite el documento del usuario actual
    const userId = req.params?.id; // Obtiene ID de la ruta si existe (para editar)
    const whereClause = { document };
    if (userId) {
        whereClause.idUsers = { [require('sequelize').Op.ne]: userId }; // Excluye al usuario actual
    }
    const user = await User.findOne({ where: whereClause });
    if (user) {
        return Promise.reject('El documento ya está registrado por otro usuario');
    }
};

const validateUniqueUserEmail = async (email, { req }) => {
     // Al editar, permite el email del usuario actual
    const userId = req.params?.id; // Obtiene ID de la ruta si existe (para editar)
    const whereClause = { email };
     if (userId) {
        whereClause.idUsers = { [require('sequelize').Op.ne]: userId }; // Excluye al usuario actual
    }
    const user = await User.findOne({ where: whereClause });
    if (user) {
        return Promise.reject('El correo electrónico ya está registrado por otro usuario');
    }
};

// Validador opcional para idRole (si quieres asegurar que el ID exista en la tabla Roles)
const validateRoleExists = async (idRole) => {
    if (!idRole) return; // Si es opcional y no se envía, pasa
    const role = await Role.findByPk(idRole);
    if (!role) {
        return Promise.reject('El rol seleccionado no existe');
    }
};

// --- Validación para CREAR Usuario (Corregida) ---
const createUserValidation = [
    body('document_type')
        .notEmpty().withMessage('El tipo de documento es obligatorio')
        .isString().withMessage('Tipo de documento debe ser texto')
        .trim()
        .isLength({ max: 30 }).withMessage('Tipo de documento demasiado largo (máx 30)'),

    body('document')
        .notEmpty().withMessage('El número de documento es obligatorio')
        .isString().withMessage('Número de documento debe ser texto')
        .trim()
        .isLength({ max: 30 }).withMessage('Número de documento demasiado largo (máx 30)')
        .custom(validateUniqueUserDocument), // Valida unicidad

    body('cellphone')
        .notEmpty().withMessage('El número de celular es obligatorio')
        .isString().withMessage('Celular debe ser texto')
        .trim()
        .matches(/^\d{7,15}$/).withMessage('Celular debe tener entre 7 y 15 dígitos') // Más específico que isLength
        .isLength({ max: 15 }), // Redundante pero no daña

    body('full_name')
        .notEmpty().withMessage('El nombre completo es obligatorio')
        .isString().withMessage('Nombre completo debe ser texto')
        .trim()
        .isLength({ max: 60 }).withMessage('Nombre completo demasiado largo (máx 60)'),

    body('email')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Formato de correo inválido')
        .normalizeEmail() // Buena práctica: normaliza el email
        .isLength({ max: 255 }).withMessage('Correo demasiado largo (máx 255)')
        .custom(validateUniqueUserEmail), // Valida unicidad

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 10, max: 10 }).withMessage('La contraseña debe tener exactamente 10 caracteres')
        // *** AÑADIDO: Validación de tipos de caracteres con Regex ***
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10}$/)
        .withMessage('La contraseña debe incluir mayúscula, minúscula, número y símbolo (@$!%*?&)'),

    body('idRole')
        // Si el rol es OBLIGATORIO al crear, cambia .optional() por .notEmpty()
        .notEmpty().withMessage('El rol es obligatorio') // Asumiendo que es obligatorio
        .isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExists), // Opcional: Valida que el rol exista

    body('status')
        .optional() // Es opcional porque tiene defaultValue en el modelo
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),
];

// --- Validación para ACTUALIZAR Usuario (Ajustada para validar unicidad excluyendo al propio usuario) ---
const updateUserValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('El ID de usuario debe ser un número entero positivo')
        .custom(validateUserExistence), // Valida que el usuario a editar exista

    // Validaciones opcionales para los campos que se pueden actualizar
    // Nota: No validamos password aquí, usualmente se hace en una ruta separada.
    body('document_type')
        .optional()
        .isString().withMessage('Tipo de documento debe ser texto').trim()
        .isLength({ max: 30 }).withMessage('Tipo de documento demasiado largo (máx 30)'),

    body('document')
        .optional()
        .isString().withMessage('Número de documento debe ser texto').trim()
        .isLength({ max: 30 }).withMessage('Número de documento demasiado largo (máx 30)')
        .custom(validateUniqueUserDocument), // Valida unicidad (excluyendo al usuario actual)

    body('cellphone')
        .optional()
        .isString().withMessage('Celular debe ser texto').trim()
        .matches(/^\d{7,15}$/).withMessage('Celular debe tener entre 7 y 15 dígitos'),

    body('full_name')
        .optional()
        .isString().withMessage('Nombre completo debe ser texto').trim()
        .isLength({ max: 60 }).withMessage('Nombre completo demasiado largo (máx 60)'),

    body('email')
        .optional()
        .isEmail().withMessage('Formato de correo inválido').normalizeEmail()
        .isLength({ max: 255 }).withMessage('Correo demasiado largo (máx 255)')
        .custom(validateUniqueUserEmail), // Valida unicidad (excluyendo al usuario actual)

    body('idRole')
        .optional()
        .isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo')
        .custom(validateRoleExists), // Opcional: Valida que el rol exista

    body('status')
        .optional()
        .isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),

    // Asegurarse de que al menos un campo se envíe para actualizar (o permitir actualizaciones vacías?)
    // Esto es más complejo, podría requerir una validación personalizada al final.
];



// --- Validaciones para DELETE y GET por ID (Mantenidas como estaban) ---
const deleteUserValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo').custom(validateUserExistence),
];

const getUserByIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo').custom(validateUserExistence),
];

// --- Validación para Cambiar Estado (Mantenida como estaba) ---
const changeStateValidation = [
     param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo').custom(validateUserExistence),
     // El estado viene en el body, no como param
    body('status').exists().withMessage('El estado es requerido').isBoolean().withMessage('El estado debe ser un valor booleano (true/false)'),
];


module.exports = {
    createUserValidation,
    updateUserValidation,
    deleteUserValidation,
    getUserByIdValidation,
    changeStateValidation,
};