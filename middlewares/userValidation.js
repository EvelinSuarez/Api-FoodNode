// middlewares/userValidation.js
const { body, param, validationResult: expressValidationResult } = require('express-validator');
const { Op } = require('sequelize');
const { user: User, role: Role } = require('../models'); // Asegúrate que la ruta a tus modelos es correcta

/**
 * Middleware para validar que un usuario existe.
 * Usado en rutas que operan sobre un usuario específico.
 */
const validateUserExistence = async (idUserValue) => {
    const user = await User.findByPk(idUserValue);
    if (!user) {
        return Promise.reject('El usuario especificado no existe.');
    }
};

/**
 * Middleware personalizado para validar que un campo (email o documento) es único.
 * Para actualizaciones (update), ignora el propio registro que se está editando.
 */
const validateUniqueField = async (value, { req, path }) => {
    if (!value) return; // No validar si el campo es opcional y no se proporciona

    const userIdFromParams = req.params.idUser ? parseInt(req.params.idUser, 10) : null;
    const field = path;
    const whereClause = { [field]: value };

    // Si estamos en una ruta de actualización, añadimos la condición para excluir al propio usuario.
    if (userIdFromParams) {
        whereClause.idUser = { [Op.ne]: userIdFromParams }; // Op.ne significa "not equal"
    }
    
    const existingUser = await User.findOne({ where: whereClause });

    if (existingUser) {
        const fieldName = field === 'email' ? 'correo electrónico' : 'documento';
        return Promise.reject(`El ${fieldName} '${value}' ya está en uso por otro usuario.`);
    }
};

/**
 * Middleware para validar que un rol existe y está activo.
 */
const validateRoleExists = async (idRole) => {
    if (idRole === null || idRole === undefined || idRole === '') return;
    const roleId = parseInt(idRole, 10);
    if (isNaN(roleId) || roleId <= 0) return Promise.reject('ID de rol inválido.');
    
    const role = await Role.findByPk(roleId);
    if (!role) return Promise.reject('El rol seleccionado no existe o es inválido.');
    if (!role.status) return Promise.reject('El rol seleccionado no está activo.');
};

// Reglas de validación para la creación de un usuario
const createUserValidation = [
    body('full_name').notEmpty().withMessage('El nombre completo es obligatorio.').isString().trim().isLength({ min: 3, max: 60 }),
    body('document_type').notEmpty().withMessage('El tipo de documento es obligatorio.').isString().trim().isIn(['CC', 'CE', 'PA', 'PEP']).withMessage('Tipo de documento inválido.').isLength({ max: 30 }),
    body('document').notEmpty().withMessage('El número de documento es obligatorio.').isString().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9-]+$/).withMessage('Documento solo letras, números, guiones.').custom(validateUniqueField),
    body('email').notEmpty().withMessage('El correo es obligatorio.').isEmail().normalizeEmail().isLength({ max: 255 }).custom(validateUniqueField),
    body('cellphone').notEmpty().withMessage('El celular es obligatorio.').isString().trim().matches(/^\d{7,15}$/).withMessage('Celular debe tener 7-15 dígitos.'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.').isString().isLength({ min: 10, max: 10 }).withMessage('Contraseña debe tener 10 caracteres.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10}$/).withMessage('Contraseña: 1 mayús, 1 minús, 1 núm, 1 símbolo.'),
    body('idRole').notEmpty().withMessage('El rol es obligatorio.').custom(validateRoleExists),
    body('status').optional({ checkFalsy: true }).isBoolean().withMessage('Estado debe ser booleano.').toBoolean(),
];

// Reglas de validación para la actualización de un usuario
const updateUserValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence),
    body('full_name').optional().isString().trim().isLength({ min: 3, max: 60 }),
    body('document_type').optional().isString().trim().isIn(['CC', 'CE', 'PA', 'PEP']).withMessage('Tipo de documento inválido.').isLength({ max: 30 }),
    body('document').optional().isString().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9-]+$/).withMessage('Documento solo letras, números, guiones.').custom(validateUniqueField),
    body('email').optional().isEmail().normalizeEmail().isLength({ max: 255 }).custom(validateUniqueField),
    body('cellphone').optional().isString().trim().matches(/^\d{7,15}$/).withMessage('Celular debe tener 7-15 dígitos.'),
    body('password').optional({ checkFalsy: true }).if(body('password').notEmpty()).isString().isLength({ min: 10, max: 10 }).withMessage('Nueva contraseña debe tener 10 caracteres.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10}$/).withMessage('Nueva contraseña: 1 mayús, 1 minús, 1 núm, 1 símbolo.'),
    body('idRole').optional({ checkFalsy: true }).custom(validateRoleExists),
    body('status').optional().isBoolean().withMessage('Estado debe ser booleano.').toBoolean(),
];

// Reglas para otras rutas
const deleteUserValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence),
];

const getUserByIdValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence),
];

const changeStateValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence),
    body('status').exists({ checkFalsy: false }).withMessage('El estado es requerido (true o false).').isBoolean().withMessage('El estado debe ser un valor booleano (true o false).').toBoolean(),
];

module.exports = {
    createUserValidation,
    updateUserValidation,
    deleteUserValidation,
    getUserByIdValidation,
    changeStateValidation,
    validationResult: expressValidationResult
};