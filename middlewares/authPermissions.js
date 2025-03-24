const User = require("../models/user");
const { Role } = require("../models/role");
const { Privilege } = require("../models/privilege");
const { Permission } = require("../models/permission");

const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Verificamos si el usuario está autenticado
      if (!req.user || !req.user.id) {
        console.log(req.params.id);
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      const user = await User.findByPk((req.params.id), {
        include: [
          {
            model: Role,
            include: [
              {
                model: Privilege,
                include: [{ model: Permission }],
              },
            ],
          },
        ],
      });

      console.log("🔍 Usuario encontrado en la BD:", user);

      if (!user) {
        return res.status(403).json({ message: "Usuario no encontrado" });
      }

      // Extraer permisos en un array plano
      const userPermissions = user.Permiss.Privileges.flatMap((privilege) =>
        privilege.Permissions.map((permission) => permission.permissionName)
      );

      console.log("🔍 Permisos del usuario:", userPermissions);

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Se perdio la ruta" });
      }

      next(); // Si tiene permisos, continúa con la petición
    } catch (error) {
      console.error("❌ Error en autorización:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };
};

module.exports = authorize;
