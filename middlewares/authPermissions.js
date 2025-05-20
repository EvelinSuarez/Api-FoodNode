// findByRoleId debe devolver un array de strings: ['permission-privilege', 'otherpermission-otherprivilege']
const { findByRoleId } = require("../repositories/rolePrivilegesRepository");
const ADMIN_ROLE_ID = 1; // Asegúrate que este ID es correcto y es un NÚMERO

const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    const requiredPermsString = Array.isArray(requiredPermissions) && requiredPermissions.length > 0
        ? requiredPermissions.join(', ')
        : 'Ninguno específico';

    try {
      if (!req.user || typeof req.user.id === 'undefined' || typeof req.user.idRole !== 'number') { // Asegura que idRole sea número si ADMIN_ROLE_ID lo es
        console.warn("⚠️ [AUTH-PERMISSIONS] Fallo: req.user no establecido o falta id/idRole, o idRole no es número. req.user:", req.user);
        return res.status(401).json({ message: "No autorizado. Sesión inválida o información de usuario corrupta." });
      }

      const userId = req.user.id;
      const userRoleId = req.user.idRole; // Esto DEBERÍA ser un número si ADMIN_ROLE_ID es número

      // console.log(`[AUTH-PERMISSIONS] Verificando UsuarioID: ${userId}, RolID: ${userRoleId}. Permisos Requeridos: [${requiredPermsString}]`);

      if (userRoleId === ADMIN_ROLE_ID) {
        // console.log(`[AUTH-PERMISSIONS] Usuario es Admin (RolID: ${ADMIN_ROLE_ID}). Acceso concedido.`);
        return next();
      }

      if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        // console.log("[AUTH-PERMISSIONS] Ruta no requiere permisos específicos y usuario no es Admin. Acceso concedido.");
        return next(); // Si no se requieren permisos y no es admin, permitir acceso si está autenticado.
      }

      let userOwnedPermissionsCombined; // Ej: ['proveedores-view', 'insumo-create']
      try {
        // findByRoleId debe devolver el array combinado ['modulo-accion', ...]
        userOwnedPermissionsCombined = await findByRoleId(userRoleId);
      } catch (dbError) {
        console.error("❌ [AUTH-PERMISSIONS] Error al llamar a findByRoleId:", dbError);
        return res.status(500).json({ message: "Error interno al obtener permisos del rol." });
      }

      // console.log(`[AUTH-PERMISSIONS] Permisos del RolID ${userRoleId} desde BD: [${(userOwnedPermissionsCombined || []).join(', ')}]`);

      if (!userOwnedPermissionsCombined || userOwnedPermissionsCombined.length === 0) {
        console.warn(`🚫 [AUTH-PERMISSIONS] DENEGADO: RolID ${userRoleId} no tiene NINGÚN permiso asignado en la BD. Requeridos: [${requiredPermsString}]`);
        return res.status(403).json({ message: "Acceso denegado. Tu rol no tiene privilegios configurados." });
      }

      // Verificar si el usuario tiene AL MENOS UNO de los permisos requeridos
      const hasRequiredPermission = requiredPermissions.some(requiredPerm =>
        userOwnedPermissionsCombined.includes(requiredPerm)
      );

      if (hasRequiredPermission) {
        // console.log(`✅ [AUTH-PERMISSIONS] Concedido: RolID ${userRoleId} tiene al menos uno de [${requiredPermsString}].`);
        return next();
      } else {
        console.warn(`🚫 [AUTH-PERMISSIONS] DENEGADO: RolID ${userRoleId} no tiene ninguno de [${requiredPermsString}]. Permisos del usuario: [${userOwnedPermissionsCombined.join(', ')}]`);
        return res.status(403).json({ message: "No tienes los permisos necesarios para realizar esta acción." });
      }

    } catch (error) {
      console.error("❌ [AUTH-PERMISSIONS] Error fatal inesperado:", error);
      res.status(500).json({ message: "Error interno del servidor durante la autorización." });
    }
  };
};

module.exports = authorize;