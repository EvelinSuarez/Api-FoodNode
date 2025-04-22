const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  // Extraer solo el token sin el "Bearer "
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  
  // Verificar que JWT_SECRET esté definido
  if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET no está definido en las variables de entorno");
    return res.status(500).json({ message: "Error de configuración del servidor" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;


// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const verifyToken = (req, res, next) => {
//   const authHeader = req.header("authorization");

//   if (!authHeader) {
//     return res.status(401).json({ message: "Acceso denegado. No hay token." });
//   }

//   // Extraer solo el token sin el "Bearer "
//   const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(400).json({ message: "No tiene permisos" });
//     console.log(error);
//   }
// };

// module.exports = verifyToken;