// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Acceso denegado. No se proporcionó la cabecera Authorization." });
  }

  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7, authHeader.length);
  } else {
    return res.status(401).json({ message: "Formato de token inválido. Debe empezar con 'Bearer '." });
  }

  if (!token) {
    return res.status(401).json({ message: "Token no encontrado después de 'Bearer '." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no está definida.");
    return res.status(500).json({ message: "Error de configuración interna del servidor." });
  }

  try {
    const decodedPayload = jwt.verify(token, secret);
    req.user = decodedPayload; // Aquí se establece req.user con { id, email, idRole, iat, exp }
    next();
  } catch (error) {
    console.error("Error al verificar el token JWT:", error.message);
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = verifyToken;