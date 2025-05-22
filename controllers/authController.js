const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        // authService.login ahora devuelve { token, user, effectivePermissions }
        const loginData = await authService.login(req.body.email, req.body.password);
        res.status(200).json(loginData); // Enviar el objeto completo
    } catch (error) {
        // El servicio ya loguea los detalles, aquí solo devolvemos error genérico o específico si es necesario
        res.status(401).json({ message: error.message || 'Error de autenticación.' });
    }
};

// Asumo que tienes un servicio para editProfile si existe este controlador
// const editProfile = async (req, res) => {
//     try {
//         // req.user.id debería ser el ID del usuario autenticado (del token)
//         const updatedUser = await authService.editProfile(req.user.id, req.body);
//         res.json({ message: 'Perfil actualizado correctamente', user: updatedUser });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

const logout = (req, res) => {
    // El logout en backend es principalmente invalidar el token si se almacena en una lista negra (más avanzado).
    // Para un logout simple basado en JWT en cliente, el cliente solo borra el token.
    // Se puede añadir lógica aquí si es necesario (ej. registrar el logout).
    console.log("[AuthController BE] Solicitud de logout recibida.");
    res.status(200).json({ message: 'Sesión cerrada correctamente en el servidor. El cliente debe limpiar el token.' });
};

const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) }); // Devuelve solo mensajes
    }
    try {
        const { email } = req.body;
        const result = await authService.forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Error al procesar la solicitud.' });
    }
};

const verifyCode = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    try {
        const { email, code, newPassword } = req.body;
        const result = await authService.verifyCodeService(email, code, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Error al verificar el código.' });
    }
};

const validateForgotPassword = [
    body('email').isEmail().withMessage('Por favor, ingrese un correo electrónico válido.').normalizeEmail(),
];

const validateVerifyCode = [
    body('email').isEmail().withMessage('El formato del correo es inválido.').normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('El código debe ser de 6 dígitos numéricos.'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
        // Puedes añadir más validaciones de contraseña si lo deseas
        // .matches(/\d/).withMessage('La contraseña debe contener al menos un número.')
        // .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula.')
        // .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula.')
        // .matches(/[^a-zA-Z\d]/).withMessage('La contraseña debe contener al menos un caracter especial.')
];

module.exports = {
    login,
    //editProfile, // Descomenta si lo tienes implementado
    logout,
    forgotPassword,
    verifyCode,
    validateForgotPassword,
    validateVerifyCode
};