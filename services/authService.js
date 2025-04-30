// services/authService.js (Backend - COMPLETO Y CORREGIDO)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");

// --- ¡¡IMPORTANTE!! Asegúrate de importar la función CORRECTA y CORREGIDA del repositorio ---
//       Esta función debe devolver un array como: [{ modulo: 'key_modulo', privilegio: 'key_privilegio' }, ...]
// const { findPrivilegesByRoleId } = require('../repositories/rolePrivilegesRepository'); // Comenta/Elimina si renombraste
const { findStructuredPermissionsByRoleId } = require('../repositories/rolePrivilegesRepository'); // <-- Importa la función (renombrada o corregida)

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Default a 24h

// Verificación de seguridad al inicio
if (!JWT_SECRET) {
  console.error("❌ ERROR CRÍTICO: JWT_SECRET no está definido en las variables de entorno.");
  // Considera lanzar un error o salir si es inaceptable en producción
  // process.exit(1); // O throw new Error(...)
}

/**
 * Autentica a un usuario, genera un token JWT y recupera sus permisos estructurados.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña del usuario (sin hashear).
 * @returns {Promise<{user: object, token: string}>} - Objeto con datos del usuario (incluyendo permissions) y el token.
 * @throws {Error} - Si las credenciales son inválidas o hay un error interno.
 */
const login = async (email, password) => {
  // Verifica disponibilidad de JWT_SECRET antes de proceder
  if (!JWT_SECRET) {
    console.error("❌ Error en login: JWT_SECRET no disponible.");
    throw new Error("Error de configuración interna del servidor."); // No expongas detalles
  }

  console.log(`[AuthService] Intentando login para email: ${email}`);

  // 1. Buscar al usuario por email e incluir su rol asociado
  const user = await User.findOne({
    where: { email },
    include: [{
        model: Role,
        as: 'role' // ¡Verifica que 'role' sea el alias correcto de tu asociación User <-> Role!
    }]
  });

  // 2. Verificar si el usuario existe
  if (!user) {
    console.warn(`[AuthService] Login fallido: Usuario no encontrado para email ${email}`);
    throw new Error("Credenciales inválidas."); // Mensaje genérico por seguridad
  }

  // 3. Validar la contraseña proporcionada contra la almacenada (hasheada)
  const isMatch = await user.validatePassword(password); // Asume que tienes este método en tu modelo User
  // Alternativa: const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.warn(`[AuthService] Login fallido: Contraseña incorrecta para email ${email}`);
    throw new Error("Credenciales inválidas."); // Mensaje genérico
  }

  console.log(`[AuthService] Usuario ${email} autenticado correctamente.`);

  // --- 4. Obtener y Estructurar Permisos del Rol ---
  let permissionsArray = []; // Inicializa un array vacío para los strings de permiso

  if (user.idRole) { // Procede solo si el usuario tiene un rol asignado (idRole existe)
      try {
          console.log(`[AuthService] Obteniendo permisos estructurados para Role ID: ${user.idRole}`);

          // Llama a la función (corregida/renombrada) del repositorio
          // Se espera que devuelva: [{ modulo: 'usuarios', privilegio: 'view' }, ...]
          const dbPrivileges = await findStructuredPermissionsByRoleId(user.idRole); // <-- LLAMA A LA FUNCIÓN CORRECTA

          console.log("[AuthService] Permisos estructurados recibidos del Repo:", dbPrivileges);

          // Transforma el resultado del repositorio al array de strings 'modulo-privilegio'
          if (Array.isArray(dbPrivileges)) {
              for (const priv of dbPrivileges) {
                  // --- ¡¡AJUSTA ESTAS CLAVES si son diferentes en el resultado del Repo!! ---
                  const moduloKey = priv.modulo;      // Clave del módulo (ej: 'usuarios')
                  const privilegeKey = priv.privilegio; // Clave del privilegio (ej: 'view')
                  // -------------------------------------------------------------------------

                  if (moduloKey && privilegeKey) { // Asegura que ambas claves existen
                      // Crea el string de permiso combinado
                      const permissionString = `${moduloKey}-${privilegeKey}`; // Ej: "usuarios-view"

                      // Añade al array si no existe ya (previene duplicados)
                      if (!permissionsArray.includes(permissionString)) {
                          permissionsArray.push(permissionString);
                      }
                  } else {
                      // Advierte si una entrada del repositorio viene incompleta
                      console.warn("[AuthService] Privilegio recibido del repo incompleto o con formato inesperado:", priv);
                  }
              }
          } else {
              // Advierte si el repositorio no devolvió un array
              console.warn(`[AuthService] findStructuredPermissionsByRoleId no devolvió un array para Role ID ${user.idRole}. Resultado:`, dbPrivileges);
          }

          console.log("[AuthService] Permisos finales generados (array de strings):", permissionsArray);

      } catch (permError) {
          // Captura errores específicos de la obtención/procesamiento de permisos
          console.error(`[AuthService] Error obteniendo/procesando permisos para Role ID ${user.idRole}:`, permError);
          // Mantiene permissionsArray vacío para no bloquear el login, pero loguea el error.
          // Considera si un error aquí debería impedir el login completamente.
          permissionsArray = [];
      }
  } else {
      // Advierte si el usuario no tiene rol (no se pueden obtener permisos)
      console.warn(`[AuthService] Usuario ${email} (ID: ${user.idUsers}) no tiene un idRole asignado. No se buscarán permisos.`);
  }
  // --- Fin Lógica de Permisos ---

  // 5. Generar el Token JWT
  // Incluye información esencial en el payload para uso posterior (ej: middlewares)
  const payload = {
      id: user.idUsers,       // ID único del usuario
      email: user.email,      // Email del usuario
      role: user.idRole       // ID del rol del usuario (importante para autorización en backend)
      // NO incluyas información sensible o innecesariamente grande aquí
  };
  const token = jwt.sign(
      payload,
      JWT_SECRET, // Tu secreto JWT
      { expiresIn: JWT_EXPIRES_IN } // Tiempo de expiración del token
  );
  console.log(`[AuthService] Token JWT generado para ${email}`);

  // 6. Construir y Devolver la Respuesta Final para el Frontend
  return {
    user: { // Objeto limpio con datos del usuario
      id: user.idUsers,
      email: user.email,
      full_name: user.full_name, // Añade otros campos públicos si los necesitas
      // Incluye información básica del rol si existe la asociación
      role: user.role ? { id: user.role.idRole, name: user.role.roleName } : null,
      // ¡¡EL ARRAY DE STRINGS DE PERMISOS PARA EL FRONTEND!!
      permissions: permissionsArray,
    },
    token: token, // El token JWT generado
  };
};

// Exporta la función login para que el controlador la pueda usar
module.exports = { login };