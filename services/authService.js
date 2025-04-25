// services/authService.js (Backend)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Asegúrate de importar el modelo Role y User correctamente
// (Usualmente desde el index.js de la carpeta models si configuraste asociaciones allí)
// const { User, Role } = require("../models"); // Ejemplo si usas index.js
const User = require("../models/user"); // Tu forma actual
const Role = require("../models/role");   // Tu forma actual
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Default a 24h si no está definido

// Verificación de seguridad al inicio
if (!JWT_SECRET) {
  console.error("ERROR CRÍTICO: JWT_SECRET no está definido en las variables de entorno. El login fallará.");
  // Considera lanzar un error o salir si esto es inaceptable en producción
  // throw new Error("Configuración crítica del servidor faltante: JWT_SECRET");
}

const login = async (email, password) => {
  // Verifica si JWT_SECRET está disponible ANTES de la consulta
  if (!JWT_SECRET) {
    // Lanza un error claro si falta el secreto, para evitar fallos silenciosos más adelante
    console.error("Error en login: JWT_SECRET no está disponible.");
    throw new Error("Error de configuración interna del servidor.");
  }

  console.log(`Intentando login para email: ${email}`); // Log útil

  const user = await User.findOne({
    where: { email },
    // --- CORRECCIÓN AQUÍ ---
    // Incluye el modelo Role USANDO el alias 'role' definido en la asociación
    include: [ // Es buena práctica usar un array para include
      {
        model: Role,
        as: 'role' // <-- ¡EL ALIAS CORRECTO!
        // Puedes añadir 'attributes' aquí si solo quieres campos específicos del rol
        // attributes: ['idRole', 'roleName']
      }
    ]
    // No necesitas excluir la contraseña aquí porque la necesitas para bcrypt.compare
  });

  if (!user) {
    console.log(`Login fallido: Usuario no encontrado para email ${email}`);
    throw new Error("Credenciales inválidas."); // Mensaje genérico por seguridad
  }

  // Compara la contraseña proporcionada con la almacenada (hasheada)
  const isMatch = await user.validatePassword(password); // Usa el método del prototipo si lo definiste
  // const isMatch = await bcrypt.compare(password, user.password); // Alternativa directa

  if (!isMatch) {
    console.log(`Login fallido: Contraseña incorrecta para email ${email}`);
    throw new Error("Credenciales inválidas."); // Mensaje genérico por seguridad
  }

  // Si el usuario y la contraseña son correctos, genera el token
  console.log(`Usuario ${email} autenticado correctamente. Generando token...`);

  // Asegúrate de que user.role (el objeto Role incluido) exista si planeas usarlo
  // El payload actual usa user.idRole, que viene directamente del modelo User y está bien
  const payload = {
      id: user.idUsers,
      email: user.email,
      role: user.idRole // O podrías usar user.role.idRole si lo necesitas desde el include
      // También podrías incluir user.role.roleName si es útil en el cliente
      // roleName: user.role ? user.role.roleName : null
  };

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  console.log(`Token generado para ${email}`);

  // Devuelve la información necesaria al controlador
  // ¡IMPORTANTE! NUNCA devuelvas el objeto 'user' completo de Sequelize aquí
  // porque contiene métodos y la contraseña hasheada. Crea un objeto limpio.
  return {
    user: { // Objeto limpio para el frontend
      id: user.idUsers, // Cambiado a 'id' para posible consistencia
      email: user.email,
      full_name: user.full_name, // Añade otros campos necesarios
      // Puedes enviar el nombre del rol si lo incluiste y es necesario
      role: user.role ? { id: user.role.idRole, name: user.role.roleName } : null
      // O simplemente el idRole como lo tenías:
      // roleId: user.idRole
    },
    token,
  };
};

// Asegúrate de exportar solo lo necesario
module.exports = { login };