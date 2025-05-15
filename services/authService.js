// services/authService.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const User = require("../models/user");
const Role = require("../models/role");

// ¡IMPORTANTE! Asegúrate de que esta sea la función que devuelve un array de objetos:
// [{ permissionKey: '...', privilegeKey: '...' }, ...]
// Y NO la que devuelve ['modulo-accion', ...]
// Si la renombraste o tienes dos versiones en rolePrivilegesRepository, usa la correcta aquí.
// Basado en tu rolePrivilegesRepository.js anterior, la función que hace esto se llamaba getEffectiveKeysByRoleId
// y la que usa el middleware authorize (que devuelve ['modulo-accion']) la exportaste como findByRoleId.
const { getEffectiveKeysByRoleId } = require('../repositories/rolePrivilegesRepository');
// Si renombraste getEffectiveKeysByRoleId a algo más o necesitas una función diferente del repo, ajústalo.

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!JWT_SECRET) {
  console.error("❌ ERROR CRÍTICO: JWT_SECRET no está definido.");
  // process.exit(1); // Considera el impacto si descomentas
}
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ ADVERTENCIA: EMAIL_USER o EMAIL_PASS no están definidos. La función de olvido de contraseña no podrá enviar correos.");
}

const login = async (email, password) => {
    if (!JWT_SECRET) {
      console.error("❌ Error en login: JWT_SECRET no disponible.");
      throw new Error("Error de configuración interna del servidor.");
    }
    console.log(`[AuthService BE] Intentando login para email: ${email}`);
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['idRole', 'roleName'] }] // Especificar atributos del rol
    });

    if (!user) {
      console.warn(`[AuthService BE] Login fallido: Usuario no encontrado para email ${email}`);
      throw new Error("Credenciales inválidas.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AuthService BE] Login fallido: Contraseña incorrecta para email ${email}`);
      throw new Error("Credenciales inválidas.");
    }

    if (!user.status) {
        console.warn(`[AuthService BE] Login fallido: Usuario inactivo para email ${email}`);
        throw new Error('La cuenta de usuario está inactiva.');
    }
    console.log(`[AuthService BE] Usuario ${email} autenticado correctamente.`);

    // --- Lógica de Permisos para el Frontend ---
    // Esta lógica construye el objeto { modulo: [accion1, accion2], ... }
    let effectivePermissionsForFrontend = {};
    if (user.idRole) {
        try {
            console.log(`[AuthService BE] Obteniendo claves de permisos (obj {pKey, privKey}) para Role ID: ${user.idRole}`);
            // Asegúrate que getEffectiveKeysByRoleId devuelve [{permissionKey: '...', privilegeKey: '...'}, ...]
            const permissionObjectsArray = await getEffectiveKeysByRoleId(user.idRole);
            // console.log("[AuthService BE] Objetos de permisos recibidos del Repo:", JSON.stringify(permissionObjectsArray, null, 2));

            if (Array.isArray(permissionObjectsArray)) {
                permissionObjectsArray.forEach(permObject => {
                    // permObject es { permissionKey: 'roles', privilegeKey: 'view' }
                    const pKey = permObject.permissionKey;
                    const privKey = permObject.privilegeKey;

                    if (pKey && privKey) {
                        if (!effectivePermissionsForFrontend[pKey]) {
                            effectivePermissionsForFrontend[pKey] = [];
                        }
                        if (!effectivePermissionsForFrontend[pKey].includes(privKey)) {
                            effectivePermissionsForFrontend[pKey].push(privKey);
                        }
                    } else {
                        console.warn("[AuthService BE] Objeto de permiso del repositorio incompleto:", permObject);
                    }
                });
            } else {
                console.warn(`[AuthService BE] getEffectiveKeysByRoleId no devolvió un array para Role ID ${user.idRole}. Recibido:`, permissionObjectsArray);
            }
            console.log("[AuthService BE] Permisos finales para el frontend:", JSON.stringify(effectivePermissionsForFrontend));
        } catch (permError) {
            console.error(`[AuthService BE] Error obteniendo/procesando permisos para Role ID ${user.idRole}:`, permError);
            effectivePermissionsForFrontend = {}; // Dejar vacío en caso de error
        }
    } else {
        console.warn(`[AuthService BE] Usuario ${email} no tiene idRole asignado.`);
    }
    // --- Fin Lógica de Permisos ---

    const payload = {
        id: user.idUsers, // Asegúrate que es idUsers o el nombre correcto de tu PK
        email: user.email,
        idRole: user.idRole
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log(`[AuthService BE] Token JWT generado para ${email}`);

    // El objeto user que se envía al frontend debe tener el formato que espera AuthProvider.jsx
    return {
      user: { // Este es el objeto que AuthProvider.jsx usará
        id: user.idUsers,
        email: user.email,
        full_name: user.full_name,
        // El rol anidado es útil, pero AuthProvider.jsx usa user.idRole directamente para los permisos
        role: user.role ? { id: user.role.idRole, name: user.role.roleName } : null,
        idRole: user.idRole, // Asegúrate que esta propiedad exista y sea el ID del rol
        // effectivePermissions NO se envía desde aquí al AuthProvider. AuthProvider lo carga por separado.
      },
      token: token,
      // Los permisos se envían por separado si el frontend los pide directamente en login,
      // o el frontend los pide a /effective-permissions después.
      // Si tu AuthProvider actual carga los permisos desde un endpoint separado, no necesitas enviarlos aquí.
      // Si el frontend espera `effectivePermissions` como parte de la respuesta del login, descomenta y usa:
      // effectivePermissions: effectivePermissionsForFrontend,
    };
};


const forgotPasswordService = async (email) => {
    console.log(`[AuthService BE] Solicitud de olvido de contraseña para: ${email}`);
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error('[AuthService BE] Faltan credenciales de email para forgotPasswordService.');
        throw new Error('La funcionalidad de recuperación no está disponible en este momento.');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.warn(`[AuthService BE] forgotPassword: Usuario no encontrado para ${email}.`);
        throw new Error('No se encontró un usuario con ese correo electrónico.');
    }
    if (!user.status) {
        console.warn(`[AuthService BE] forgotPassword: Cuenta inactiva para ${email}.`);
        throw new Error('La cuenta asociada a este correo está inactiva.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    user.resetCode = code;
    user.resetCodeExp = expiration;
    await user.save();
    console.log(`[AuthService BE] Código de reseteo ${code} generado y guardado para ${email}. Expira: ${expiration.toISOString()}`);

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Soporte App" <${EMAIL_USER}>`,
            to: user.email,
            subject: 'Código para Restablecer Contraseña',
            html: `<p>Hola,</p><p>Usa el siguiente código para restablecer tu contraseña:</p><h2>${code}</h2><p>Expira en 10 minutos.</p><p>Si no solicitaste esto, ignora este mensaje.</p>`,
        });
        console.log(`[AuthService BE] Email de recuperación enviado exitosamente a ${email}`);
        return { message: 'Código de verificación enviado al correo.' };

    } catch (mailError) {
        console.error(`[AuthService BE] Error enviando email a ${email}:`, mailError);
        throw new Error('Error interno al intentar enviar el correo de recuperación.');
    }
};

const verifyCodeService = async (email, code, newPassword) => {
    console.log(`[AuthService BE] Verificando código ${code} para email: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.warn(`[AuthService BE] verifyCode: Usuario no encontrado para ${email}`);
        throw new Error('Error al verificar: Usuario no encontrado.');
    }

    const now = new Date();
    if (user.resetCode !== code || !user.resetCodeExp || new Date(user.resetCodeExp) < now) {
        console.warn(`[AuthService BE] verifyCode: Código inválido o expirado para ${email}. Código ingresado: ${code}, Código DB: ${user.resetCode}, Expiración DB: ${user.resetCodeExp}`);
        throw new Error('El código de verificación es inválido o ha expirado.');
    }

    console.log(`[AuthService BE] Código ${code} verificado correctamente para ${email}. Actualizando contraseña...`);
    user.password = newPassword; // El hook 'beforeUpdate' del modelo User se encargará del hash
    user.resetCode = null;
    user.resetCodeExp = null;

    await user.save();
    console.log(`[AuthService BE] Contraseña actualizada y código limpiado para ${email}`);

    return { message: 'Contraseña restablecida exitosamente.' };
};

// Función para obtener los permisos efectivos para un rol específico (para el endpoint /effective-permissions)
const getEffectivePermissionsForRole = async (roleId) => {
    console.log(`[AuthService BE] Obteniendo permisos efectivos para frontend para Role ID: ${roleId}`);
    let effectivePermissionsForFrontend = {};
    try {
        // Usa la misma función del repositorio que devuelve [{permissionKey: '...', privilegeKey: '...'}, ...]
        const permissionObjectsArray = await getEffectiveKeysByRoleId(roleId);
        // console.log("[AuthService BE] (getEffectivePermissionsForRole) Objetos de permisos recibidos del Repo:", JSON.stringify(permissionObjectsArray, null, 2));

        if (Array.isArray(permissionObjectsArray)) {
            permissionObjectsArray.forEach(permObject => {
                const pKey = permObject.permissionKey;
                const privKey = permObject.privilegeKey;

                if (pKey && privKey) {
                    if (!effectivePermissionsForFrontend[pKey]) {
                        effectivePermissionsForFrontend[pKey] = [];
                    }
                    if (!effectivePermissionsForFrontend[pKey].includes(privKey)) {
                        effectivePermissionsForFrontend[pKey].push(privKey);
                    }
                } else {
                    console.warn("[AuthService BE] (getEffectivePermissionsForRole) Objeto de permiso del repositorio incompleto:", permObject);
                }
            });
        } else {
            console.warn(`[AuthService BE] (getEffectivePermissionsForRole) getEffectiveKeysByRoleId no devolvió un array para Role ID ${roleId}. Recibido:`, permissionObjectsArray);
        }
        console.log("[AuthService BE] (getEffectivePermissionsForRole) Permisos finales para el frontend:", JSON.stringify(effectivePermissionsForFrontend));
        return effectivePermissionsForFrontend;
    } catch (permError) {
        console.error(`[AuthService BE] (getEffectivePermissionsForRole) Error obteniendo/procesando permisos para Role ID ${roleId}:`, permError);
        return {}; // Devolver objeto vacío en caso de error
    }
};


module.exports = {
    login,
    forgotPasswordService,
    verifyCodeService,
    getEffectivePermissionsForRole // <-- Exportar la nueva función
};