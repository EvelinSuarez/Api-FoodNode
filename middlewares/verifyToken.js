// backend/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
require('dotenv').config(); // Asegúrate que dotenv se carga para acceder a process.env

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    console.warn("[VerifyToken] Acceso denegado: No se proporcionó cabecera Authorization.");
    return res.status(401).json({ message: "Acceso denegado. Se requiere autenticación." });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer' || !tokenParts[1]) {
    console.warn("[VerifyToken] Formato de token inválido. Debe ser 'Bearer <token>'. Header:", authHeader);
    return res.status(401).json({ message: "Formato de token inválido." });
  }

  const token = tokenParts[1];

  if (!JWT_SECRET) {
    console.error("CRITICAL ERROR [VerifyToken]: JWT_SECRET no está definida en las variables de entorno.");
    // En un entorno de producción, podrías querer evitar que la aplicación funcione sin esto.
    return res.status(500).json({ message: "Error de configuración interna del servidor." });
  }

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET);

    // Adjuntar el payload decodificado a req.user.
    // Este payload debe contener la información necesaria para el middleware de autorización (authPermissions.js)
    // Es decir, al menos 'id' (PK del usuario) y 'idRole' (ID numérico del rol).
    // Ejemplo de cómo se crea el payload en authService.login:
    // const payload = { id: user.idUsers, email: user.email, idRole: user.idRole };
    req.user = decodedPayload;

    // console.log("[VerifyToken] Token verificado. req.user establecido:", req.user);
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn("[VerifyToken] Token expirado. Token:", token, "Error:", error.message);
      return res.status(401).json({ message: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.", code: "TOKEN_EXPIRED" });
    }
    if (error.name === 'JsonWebTokenError') {
      console.warn("[VerifyToken] Token inválido (JsonWebTokenError). Token:", token, "Error:", error.message);
      return res.status(401).json({ message: "Token de autenticación inválido.", code: "TOKEN_INVALID" });
    }
    // Otros errores de jwt.verify
    console.error("[VerifyToken] Error inesperado al verificar el token. Error:", error);
    res.status(401).json({ message: "No se pudo verificar la autenticación.", code: "TOKEN_VERIFICATION_FAILED" });
  }
};

module.exports = verifyToken;