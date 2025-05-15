// middlewares/authPermissions.js (CORREGIDO PARA OPCIÓN A)

const { findByRoleId } = require("../repositories/rolePrivilegesRepository"); // Ajusta la ruta si es necesario
const ADMIN_ROLE_ID = 1; // Asegúrate que esto es un número si idRole en el token es un número

const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    const requiredPermsString = requiredPermissions.join(', ') || 'Ninguno específico';

    try {
      // 1. Verificar que req.user y sus propiedades necesarias (id, idRole) fueron establecidos.
      if (!req.user || typeof req.user.id === 'undefined' || typeof req.user.idRole === 'undefined' || req.user.idRole === null) {
        console.warn("⚠️ [AUTH-PERMISSIONS] Autorización fallida: Usuario no autenticado o falta información crítica (id o idRole) en req.user.");
        console.log("⚠️ [AUTH-PERMISSIONS] Contenido de req.user:", req.user);
        return res.status(401).json({ message: "No autorizado. Sesión inválida o información de usuario incompleta." });
      }

      const userId = req.user.id;
      const userRoleId = req.user.idRole; // Usamos idRole directamente del token

      // console.log(`👤 [AUTH-PERMISSIONS] Usuario autenticado: ID=${userId}, RolID=${userRoleId}`);

      // 2. Si el usuario es Administrador...
      if (userRoleId === ADMIN_ROLE_ID) {
        // console.log(`👑 [AUTH-PERMISSIONS] Usuario es Admin (RolID: ${ADMIN_ROLE_ID}). Acceso TOTAL concedido.`);
        return next();
      }

      // 3. Si NO es Admin...
      // console.log(`👤 [AUTH-PERMISSIONS] Usuario NO es Admin. Verificando permisos específicos para RolID: ${userRoleId}...`);

      if (!requiredPermissions || requiredPermissions.length === 0) {
          // console.log("✅ [AUTH-PERMISSIONS] Ruta no requiere permisos específicos y usuario está autenticado (no-admin). Acceso concedido.");
          return next();
      }

      let userOwnedPermissions;
      try {
        userOwnedPermissions = await findByRoleId(userRoleId);
      } catch (dbError) {
        console.error("❌ [AUTH-PERMISSIONS] Error al llamar a findByRoleId:", dbError);
        return res.status(500).json({ message: "Error interno al obtener permisos del rol." });
      }

      // console.log(` P [AUTH-PERMISSIONS] Permisos del usuario (RolID ${userRoleId}) desde BD: [${(userOwnedPermissions || []).join(', ')}]`);

      if (!userOwnedPermissions || userOwnedPermissions.length === 0) {
        console.warn(`⚠️ [AUTH-PERMISSIONS] Autorización fallida: RolID ${userRoleId} (no-admin) NO TIENE NINGÚN PERMISO asignado en la BD.`);
        return res.status(403).json({ message: "Acceso denegado. Tu rol no tiene privilegios configurados." });
      }

      const hasRequiredPermission = requiredPermissions.some(requiredPerm =>
        userOwnedPermissions.includes(requiredPerm)
      );

      // console.log(`❔ [AUTH-PERMISSIONS] ¿El usuario (RolID ${userRoleId}) tiene alguno de [${requiredPermsString}]? -> ${hasRequiredPermission}`);

      if (!hasRequiredPermission) {
        console.warn(`🚫 [AUTH-PERMISSIONS] Acceso DENEGADO: RolID ${userRoleId} no tiene ninguno de los permisos requeridos: [${requiredPermsString}]. Permisos del usuario: [${userOwnedPermissions.join(', ')}]`);
        return res.status(403).json({ message: "No tienes los permisos necesarios para realizar esta acción." });
      }

      // console.log('✅ [AUTH-PERMISSIONS] Autorización concedida (permiso específico encontrado para no-admin).');
      next();

    } catch (error) {
      console.error("❌ [AUTH-PERMISSIONS] Error fatal inesperado en middleware de autorización:", error);
      res.status(500).json({ message: "Error interno del servidor durante la autorización." });
    }
  };
};

module.exports = authorize;