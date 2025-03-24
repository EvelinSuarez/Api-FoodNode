const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  // Extraer solo el token sin el "Bearer "
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  console.log(token);
  

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "No tiene permisos" });
  }
};

module.exports = verifyToken;
