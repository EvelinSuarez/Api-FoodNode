// middlewares/userValidation.js
const { body, param, validationResult: expressValidationResult } = require('express-validator');
const { Op } = require('sequelize');
const { user: User, role: Role } = require('../models'); // Ajusta la ruta

const validateUserExistence = async (idUserValue, { req }) => {
    if (!idUserValue || isNaN(parseInt(idUserValue, 10)) || parseInt(idUserValue, 10) <= 0) {
      // Esto no debería ocurrir si la validación .isInt({gt:0}) ya se aplicó al param.
      // Pero es una salvaguarda.
      return Promise.reject('ID de usuario inválido en la URL.');
    }
    const user = await User.findByPk(idUserValue);
    if (!user) {
        return Promise.reject('El usuario especificado no existe.');
    }
    // req.foundUser = user; // Opcional
};

const validateUniqueField = async (value, { req, path }) => {
    if (!value) return;
    const userIdFromParams = req.params.idUser; // Correcto: usa idUser
    const field = path;
    const whereClause = { [field]: value };
    if (userIdFromParams) { // Solo para actualizaciones
        whereClause.idUsers = { [Op.ne]: userIdFromParams }; // Asume que PK es idUsers
    }
    const existingUser = await User.findOne({ where: whereClause });
    if (existingUser) {
        const fieldName = field === 'email' ? 'correo electrónico' : 'documento';
        return Promise.reject(`El ${fieldName} '${value}' ya está registrado por otro usuario.`);
    }
};

const validateRoleExists = async (idRole) => {
    if (idRole === null || idRole === undefined || idRole === '') return;
    const roleId = parseInt(idRole, 10);
    if (isNaN(roleId) || roleId <= 0) return Promise.reject('ID de rol inválido.');
    const role = await Role.findByPk(roleId);
    if (!role) return Promise.reject('El rol seleccionado no existe o es inválido.');
    if (!role.status) return Promise.reject('El rol seleccionado no está activo.');
};

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

const updateUserValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence), // Usa idUser
    body('full_name').optional().isString().trim().isLength({ min: 3, max: 60 }),
    body('document_type').optional().isString().trim().isIn(['CC', 'CE', 'PA', 'PEP']).withMessage('Tipo de documento inválido.').isLength({ max: 30 }),
    body('document').optional().isString().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9-]+$/).withMessage('Documento solo letras, números, guiones.').custom(validateUniqueField),
    body('email').optional().isEmail().normalizeEmail().isLength({ max: 255 }).custom(validateUniqueField),
    body('cellphone').optional().isString().trim().matches(/^\d{7,15}$/).withMessage('Celular debe tener 7-15 dígitos.'),
    body('password').optional({ checkFalsy: true }).if(body('password').notEmpty()).isString().isLength({ min: 10, max: 10 }).withMessage('Nueva contraseña debe tener 10 caracteres.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10}$/).withMessage('Nueva contraseña: 1 mayús, 1 minús, 1 núm, 1 símbolo.'),
    body('idRole').optional({ checkFalsy: true }).custom(validateRoleExists),
    body('status').optional().isBoolean().withMessage('Estado debe ser booleano.').toBoolean(),
];

const deleteUserValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence), // Usa idUser
];

const getUserByIdValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence), // Usa idUser
];

const changeStateValidation = [
    param('idUser').isInt({ gt: 0 }).withMessage('ID de usuario en URL inválido.').custom(validateUserExistence), // Usa idUser
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