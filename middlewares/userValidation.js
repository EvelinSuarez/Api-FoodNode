const { body, param, validationResult } = require('express-validator');
const User = require('../models/user');

const validateUserExistence = async (id) => {
    
    const user = await User.findByPk(id);
    if (!user) {
        return Promise.reject('El usuario no existe');
    }
};

const validateUniqueUserDocument = async (document) => {
    const user = await User.findOne({ where: { document } });
    if (user) {
        return Promise.reject('El documento del usuario ya existe');
    }
};

const validateUniqueUserEmail = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (user) {
        return Promise.reject('El correo electrónico del usuario ya existe');
    }
};

const createUserValidation = [
    body('document_type').notEmpty().withMessage('El tipo de documento es obligatorio').isString().isLength({ max: 30 }),
    body('document').notEmpty().withMessage('El número de documento es obligatorio').isString().isLength({ max: 30 }).custom(validateUniqueUserDocument),
    body('cellphone').notEmpty().withMessage('El número de celular es obligatorio').isString().isLength({ max: 15 }),
    body('full_name').notEmpty().withMessage('El nombre completo es obligatorio').isString().isLength({ max: 60 }),
    body('email').notEmpty().withMessage('El correo electrónico es obligatorio').isEmail().isLength({ max: 255 }).custom(validateUniqueUserEmail),
    body('password').notEmpty().withMessage('La contraseña es obligatoria').isLength({ min: 10, max: 10 }).withMessage('La contraseña debe tener exactamente 10 caracteres'),
    body('idRole').optional().isInt().withMessage('El ID del rol debe ser un número entero'),
    body('state').optional().isBoolean().withMessage('El estado debe ser un valor booleano'),
];

const updateUserValidation = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    param('id').custom(validateUserExistence),
];



const deleteUserValidation = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    param('id').custom(validateUserExistence),
];

const getUserByIdValidation = [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    param('id').custom(validateUserExistence),
];

const changeStateValidation = [
    body('status').isBoolean().withMessage('El estado debe ser un valor booleano'),
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    param('id').custom(validateUserExistence),
];

module.exports = {
    createUserValidation,
    updateUserValidation,
    deleteUserValidation,
    getUserByIdValidation,
    changeStateValidation,
};
