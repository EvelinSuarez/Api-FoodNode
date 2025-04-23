// verifyToken.js (Asegúrate que este es el que usas en tus rutas)
const jwt = require("jsonwebtoken");
require('dotenv').config(); // Asegúrate que JWT_SECRET está en tu .env

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization"); // 'Authorization' es estándar

  if (!authHeader) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  // Extraer solo el token quitando "Bearer "
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null; // Mejor verificar que exista "Bearer "

  if (!token) {
    return res.status(401).json({ message: "Formato de token inválido. Falta 'Bearer '." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET no está definido en .env");
    return res.status(500).json({ message: "Error de configuración del servidor." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Añade el payload del token (que debería incluir id, rol, etc.) a req.user
    next(); // Pasa al siguiente middleware o al controlador
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    // Si el token es inválido o expirado, devuelve 401 o 403
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = verifyToken;