// ../middlewares/verifyToken.js (o la ruta correcta donde lo tengas)

const jwt = require("jsonwebtoken");
require('dotenv').config(); // Asegúrate de que carga las variables de .env al inicio

/**
 * Middleware para verificar el token JWT enviado en la cabecera Authorization.
 * Espera el formato: Authorization: Bearer <token>
 *
 * Si el token es válido:
 *  - Decodifica el payload.
 *  - Adjunta el payload decodificado a `req.user`.
 *  - Llama a `next()` para pasar al siguiente middleware o controlador.
 *
 * Si el token falta, tiene formato incorrecto, es inválido o ha expirado:
 *  - Envía una respuesta de error (generalmente 401 Unauthorized).
 *
 * Si falta la variable de entorno JWT_SECRET:
 *  - Envía un error 500 Internal Server Error (problema de configuración).
 */
const verifyToken = (req, res, next) => {
  // 1. Obtener la cabecera 'Authorization'
  const authHeader = req.header("Authorization");

  // 2. Comprobar si la cabecera existe
  if (!authHeader) {
    return res.status(401).json({ message: "Acceso denegado. No se proporcionó la cabecera Authorization." });
  }

  // 3. Comprobar si la cabecera tiene el formato "Bearer <token>" y extraer el token
  let token;
  if (authHeader.startsWith("Bearer ")) {
    // Extraer la parte del token después de "Bearer "
    token = authHeader.substring(7, authHeader.length);
  } else {
    // Formato incorrecto
    return res.status(401).json({ message: "Formato de token inválido. Debe empezar con 'Bearer '." });
  }

  // 4. Comprobar si el token extraído existe (por si acaso la cabecera era solo "Bearer ")
  if (!token) {
    return res.status(401).json({ message: "Token no encontrado después de 'Bearer '." });
  }

  // 5. Comprobar si la variable de entorno JWT_SECRET está definida
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Este es un error crítico de configuración del servidor
    console.error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no está definida.");
    return res.status(500).json({ message: "Error de configuración interna del servidor." });
  }

  // 6. Intentar verificar el token
  try {
    // jwt.verify decodifica y valida el token usando la clave secreta
    // Si es inválido o ha expirado, lanzará una excepción
    const decodedPayload = jwt.verify(token, secret);

    // ¡Token válido! Adjuntamos el payload decodificado al objeto `req`
    // Ahora, los siguientes middlewares y controladores pueden acceder a `req.user`
    // que contiene la información que pusiste en el token (ej. id, idRole)
    req.user = decodedPayload;

    // Pasamos el control al siguiente middleware o al controlador final de la ruta
    next();

  } catch (error) {
    // 7. Capturar errores de verificación (firma inválida, token expirado, etc.)
    console.error("Error al verificar el token JWT:", error.message);

    // Enviamos un error 401 (No autorizado) que indica que la autenticación falló
    // Podrías diferenciar entre tipos de error (ej., TokenExpiredError) si necesitas lógica específica
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// Exportar la función middleware para poder usarla en tus archivos de rutas
module.exports = verifyToken;