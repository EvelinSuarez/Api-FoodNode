// routes/authRoutes.js
const express = require('express');

// Importa TODO lo que necesitas del controlador
const {
    logout,
    login,
    forgotPassword,      // <-- Usa el nuevo controlador
    verifyCode,          // <-- Usa el nuevo controlador
    validateForgotPassword, // <-- Usa la nueva validación (opcional)
    validateVerifyCode      // <-- Usa la nueva validación (opcional)
    // editProfile y sus validaciones si las tienes aquí también
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout); // Asumiendo que esta ruta existe/es necesaria

// Usa el controlador (y opcionalmente la validación antes)
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-code', validateVerifyCode, verifyCode);

// ... tus otras rutas como editProfile ...

module.exports = router;