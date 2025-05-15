// controllers/authController.js

const { body, validationResult } = require('express-validator');
const authService = require('../services/authService'); // Ya importado

// --- Funciones existentes ---
const login = async (req, res) => {
    try {
        const { user, token } = await authService.login(req.body.email, req.body.password);
        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message || 'Credenciales inválidas' });
    }
};

const editProfile = async (req, res) => {
    try {
        const updatedUser = await authService.editProfile(req.user.id, req.body);
        res.json({ message: 'Perfil actualizado correctamente', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const validateEditProfile = [ /* ... tu validación ... */ ];

const logout = (req, res) => {
    res.json({ message: 'Sesión cerrada (cliente debe borrar token)' });
};

// --- NUEVO CONTROLADOR: forgotPassword ---
const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        // Llama al servicio para manejar la lógica
        const result = await authService.forgotPasswordService(email);
        res.json(result); // Devuelve el mensaje del servicio ({ message: '...' })
    } catch (error) {
        // Maneja errores específicos del servicio o errores generales
        res.status(404).json({ message: error.message || 'Error al procesar la solicitud de olvido de contraseña.' });
    }
};

// --- NUEVO CONTROLADOR: verifyCode ---
const verifyCode = async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, code, newPassword } = req.body;
         // Llama al servicio para verificar y actualizar
        const result = await authService.verifyCodeService(email, code, newPassword);
        res.json(result); // Devuelve el mensaje del servicio ({ message: '...' })
    } catch (error) {
         // El servicio puede lanzar errores por código inválido/expirado o usuario no encontrado
        res.status(400).json({ message: error.message || 'Error al verificar el código o restablecer la contraseña.' });
    }
};

// --- Validaciones (Opcional pero recomendado) ---
const validateForgotPassword = [
    body('email').isEmail().withMessage('Por favor, ingrese un correo electrónico válido.'),
    // Puedes añadir normalización si quieres: .normalizeEmail()
];

const validateVerifyCode = [
    body('email').isEmail().withMessage('El formato del correo es inválido.'),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('El código debe ser de 6 dígitos numéricos.'),
    body('newPassword').isLength({ min: 10 }).withMessage('La nueva contraseña debe tener al menos 10 caracteres.')
    // Aquí podrías añadir la validación regex compleja si quieres reforzarla en el backend también
    // .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/)
    // .withMessage('La contraseña no cumple los requisitos de seguridad.')
];


// Exporta TODAS las funciones, incluyendo las nuevas
module.exports = {
    login,
    editProfile,
    logout,
    validateEditProfile,
    forgotPassword,       // <-- Exportar nuevo controlador
    verifyCode,           // <-- Exportar nuevo controlador
    validateForgotPassword, // <-- Exportar validación (opcional)
    validateVerifyCode      // <-- Exportar validación (opcional)
};