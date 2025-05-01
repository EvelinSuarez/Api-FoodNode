// C:\Users\daniela\Documents\Api-FoodNode\middlewares\authPermissions.js

const { findByRoleId } = require("../repositories/rolePrivilegesRepository");

// --- ¡IMPORTANTE! Define el ID del rol de Administrador ---
//      Asegúrate de que este valor coincida con el ID que representa
//      al rol de Administrador en tu base de datos (tabla 'roles').
//      Puede ser un número (como 1) o un string (como 'admin_role_uuid'),
//      dependiendo de cómo almacenes los IDs de roles.
//      Es buena práctica obtenerlo de una constante o variable de entorno.
const ADMIN_ROLE_ID = 1; // <-- CAMBIA ESTO por el ID real de tu rol Admin

/**
 * Middleware de autorización basado en roles y permisos.
 * Concede acceso total si el usuario tiene el rol ADMIN_ROLE_ID.
 * De lo contrario, verifica si el rol del usuario tiene al menos uno de los permisos requeridos.
 *
 * @param {string[]} [requiredPermissions=[]] - Array de nombres de permisos requeridos para la ruta. Si está vacío, cualquier usuario autenticado (o Admin) pasará.
 * @returns {Function} Middleware function (req, res, next).
 */
const authorize = (requiredPermissions = []) => { // Default a array vacío
  return async (req, res, next) => {

    const requiredPermsString = requiredPermissions.join(', ') || 'Ninguno Específico';
    console.log(`🛡️ Autorizando ruta. Permisos Requeridos: [${requiredPermsString}]`);

    try {
      // 1. Verificar autenticación básica y existencia de rol
      //    (Asegúrate que tu middleware de autenticación previo ya pobló req.user)
      if (!req.user || typeof req.user.id === 'undefined' || typeof req.user.role === 'undefined') {
        console.warn("⚠️ Autorización fallida: Usuario no autenticado o falta información de rol/id.");
        // Usamos 401 Unauthorized para problemas de autenticación/identificación
        return res.status(401).json({ message: "Usuario no autenticado o información incompleta" });
      }
      const userId = req.user.id;
      // Asegúrate que req.user.role contiene el ID del rol, no el objeto rol completo.
      const userRoleId = req.user.role;
      console.log(`👤 Usuario autenticado: ID=${userId}, RolID=${userRoleId}`);

      // --- ⭐ VALIDACIÓN DE ADMINISTRADOR ⭐ ---
      // Si el ID del rol del usuario coincide con el de Admin, conceder acceso total inmediatamente.
      // Asegúrate que la comparación funcione (ej. number vs number, string vs string)
      if (userRoleId === ADMIN_ROLE_ID) {
        console.log(`👑 Usuario es Admin (Rol ID: ${ADMIN_ROLE_ID}). Acceso TOTAL concedido. Saltando verificación de permisos específicos.`);
        return next(); // El Admin tiene acceso a todo, continuar al controlador.
      }
      // --- Fin de la validación de Admin ---

      // 2. Si NO es Admin, continuar con la lógica de permisos normales:
      console.log(`👤 Usuario NO es Admin. Verificando permisos específicos para Rol ID: ${userRoleId}...`);

      // 2.1. Si la ruta NO requiere permisos específicos, permitir acceso (ya que no es Admin pero está autenticado)
      //      Si quieres que *siempre* se requiera un permiso explícito para no-admins, comenta o quita este bloque.
      if (!requiredPermissions || requiredPermissions.length === 0) {
          console.log("✅ Ruta no requiere permisos específicos y usuario está autenticado (pero no es admin). Acceso concedido.");
          return next();
      }

      
      // 2.2. Si la ruta SÍ requiere permisos, obtener los privilegios del rol del usuario
      const userPrivileges = await findByRoleId(userRoleId);
      // console.log(" P Privilegios obtenidos del Repo para rol no-admin:", JSON.stringify(userPrivileges, null, 2)); // Log detallado si es necesario

      // 2.3. Verificar si se encontraron privilegios para el rol (para roles no-admin)
      if (!userPrivileges || userPrivileges.length === 0) {
        console.warn(`⚠️ Autorización fallida: Rol ${userRoleId} (no-admin) SIN PRIVILEGIOS asignados en la BD.`);
        // Usamos 403 Forbidden porque el usuario está identificado pero no autorizado.
        return res.status(403).json({ message: "Acceso denegado. Tu rol no tiene privilegios configurados." });
      }

      // 2.4. Extraer los NOMBRES de los privilegios del usuario (solo si hay privilegios)
      const userPermissions = userPrivileges
        .map(priv => priv.privilege?.privilegeName) // Mapea al nombre del privilegio
        .filter(Boolean); // Filtra nombres nulos o undefined

      console.log(` P Permisos extraídos del usuario (Rol ${userRoleId}): [${userPermissions.join(', ')}]`);

      // 2.5. Verificar si el usuario (no-admin) tiene AL MENOS UNO de los permisos requeridos
      const hasPermission = requiredPermissions.some(requiredPerm =>
        userPermissions.includes(requiredPerm)
      );

      console.log(`❔ ¿El usuario (Rol ${userRoleId}) tiene alguno de [${requiredPermsString}]? -> ${hasPermission}`);

      // 2.6. Si no tiene ninguno de los permisos requeridos, denegar acceso
      if (!hasPermission) {
        console.warn(`🚫 Acceso DENEGADO: Rol ${userRoleId} no tiene ninguno de los permisos requeridos: [${requiredPermsString}].`);
        // Usamos 403 Forbidden
        return res.status(403).json({ message: "No tienes los permisos necesarios para realizar esta acción" });
      }

      // 2.7. Si tiene el permiso, continuar con la siguiente función (el controlador)
      console.log('✅ Autorización concedida (permiso específico encontrado para no-admin). Llamando a next()...');
      next();

    } catch (error) {
      // Capturar cualquier error durante el proceso de autorización
      console.error("❌ Error fatal en middleware de autorización:", error);
      // Usamos 500 Internal Server Error para errores inesperados del servidor
      res.status(500).json({ message: "Error interno del servidor durante la autorización" });
    }
  };
};

module.exports = authorize;