const { getRolePrivilegeById } = require("../repositories/rolePrivilegesRepository");


const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      const userPrivileges = await getRolePrivilegeById(req.user.role);

      if (!userPrivileges || userPrivileges.length === 0) {
        return res.status(403).json({ message: "Usuario sin privilegios asignados" });
      }

      // Extraer todos los permisos en un array
      const userPermissions = userPrivileges.map((priv) => priv.privilege.privilegeName);

      console.log("✅ Permisos del usuario:", userPermissions);

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "No tienes permisos para acceder" });
      }

      next();
    } catch (error) {
      console.error("❌ Error en autorización:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };
};

module.exports = authorize;
