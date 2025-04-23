// authController.js

const { ExpressValidator } = require('express-validator'); // No usado? Considera eliminarlo si no lo usas.
const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    // 🔹 Recibir el token y usuario correctamente
    const { user, token } = await authService.login(req.body.email, req.body.password);
    res.json({ user, token });
  } catch (error) {
    // Es mejor devolver un 401 (Unauthorized) o 400 (Bad Request) dependiendo del error específico
    res.status(401).json({ message: error.message || 'Credenciales inválidas' });
  }
};

const editProfile = async (req, res) => {
    try {
        // Asegúrate que el middleware (verifyToken) añade req.user con el id correcto
        const updatedUser = await authService.editProfile(req.user.id, req.body);
        res.json({ message: 'Perfil actualizado correctamente', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const logout = (req, res) => {
    // Logout con JWT suele ser solo del lado del cliente (borrar token).
    // A menos que tengas una blacklist de tokens en el servidor.
    res.json({ message: 'Sesión cerrada (cliente debe borrar token)' });
};

// Exporta TODAS las funciones juntas al final
module.exports = { login, editProfile, logout };