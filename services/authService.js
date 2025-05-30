const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Asegúrate que la importación de modelos sea correcta para tu estructura.
// Esto asume que ../models/index.js exporta un objeto db con db.user y db.role.
const { user: User, role: Role } = require("../models");

// Verifica si los modelos se importaron. Si no, esto fallará al inicio.
if (!User) {
    console.error("❌ ERROR CRÍTICO EN AUTHSERVICE: El modelo User NO está definido después de la importación.");
    throw new Error("Configuración de modelo User incorrecta."); // Detiene la app si es crítico
}
if (!Role) {
    console.error("❌ ERROR CRÍTICO EN AUTHSERVICE: El modelo Role NO está definido después de la importación.");
    // Podrías permitir que continúe si el rol no es estrictamente necesario para todas las funciones,
    // pero para login es importante.
    // throw new Error("Configuración de modelo Role incorrecta.");
}

const { getEffectiveKeysByRoleId } = require('../repositories/rolePrivilegesRepository');

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!JWT_SECRET) {
  console.error("❌ ERROR CRÍTICO: JWT_SECRET no está definido en las variables de entorno.");
}
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ ADVERTENCIA: EMAIL_USER o EMAIL_PASS no están definidos. La función de olvido de contraseña no podrá enviar correos.");
}

const login = async (email, password) => {
    if (!JWT_SECRET) {
      console.error("❌ Error en login (authService): JWT_SECRET no disponible.");
      throw new Error("Error de configuración interna del servidor.");
    }
    console.log(`[AuthService BE] 1. Intentando login para email: ${email}`);

    try {
        console.log("[AuthService BE] 2. Antes de User.findOne. Modelo User:", User ? "Definido" : "UNDEFINED!!!", "Modelo Role:", Role ? "Definido" : "UNDEFINED!!!");

        const user = await User.findOne({
            where: { email },
            // Temporalmente quitamos el include para aislar
        });

        console.log("[AuthService BE] 3. Después de User.findOne.");

        if (user) {
            console.log('[AuthService BE - DIAGNÓSTICO SIMPLIFICADO] User object (sin include):', JSON.stringify(user, null, 2));
        } else {
            console.log(`[AuthService BE - DIAGNÓSTICO SIMPLIFICADO] User not found for email '${email}' (sin include).`);
            throw new Error("Credenciales inválidas o usuario no registrado (desde authService - no encontrado).");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("[AuthService BE] 4. Después de bcrypt.compare. isMatch:", isMatch);

        if (!isMatch) {
          console.warn(`[AuthService BE] Login fallido: Contraseña incorrecta para email ${email}`);
          throw new Error("Credenciales inválidas o usuario no registrado (desde authService - contraseña incorrecta).");
        }

        if (!user.status) {
            console.warn(`[AuthService BE] Login fallido: Usuario inactivo para email ${email}`);
            throw new Error('Su cuenta de usuario se encuentra inactiva. Contacte al administrador.');
        }

        console.log(`[AuthService BE] 5. Usuario ${email} autenticado (ID: ${user.idUsers}, RoleID: ${user.idRole}). Procediendo a cargar rol y permisos.`);

        let userRoleData = null;
        if (user.idRole && Role) { // Verifica que Role esté definido
            console.log(`[AuthService BE] 6. Intentando cargar Role con idRole: ${user.idRole}.`);
            try {
                userRoleData = await Role.findByPk(user.idRole, { attributes: ['idRole', 'roleName'] });
                if (userRoleData) {
                    console.log('[AuthService BE - DIAGNÓSTICO] Rol cargado por separado:', JSON.stringify(userRoleData, null, 2));
                } else {
                    console.warn(`[AuthService BE - DIAGNÓSTICO] No se encontró Rol con idRole: ${user.idRole} al cargarlo por separado.`);
                    // Este es un punto crítico. Si el rol es obligatorio, aquí se podría lanzar un error
                    // o el controlador podría interpretarlo como "role not associated".
                }
            } catch (roleError) {
                console.error(`[AuthService BE] Error cargando Rol por separado para idRole ${user.idRole}:`, roleError);
                // Considerar lanzar un error si la carga del rol es crítica
            }
        } else if (!Role) {
            console.warn(`[AuthService BE] El modelo Role no está definido. No se puede cargar el rol para el usuario.`);
        } else {
            console.warn(`[AuthService BE] Usuario ${email} (ID: ${user.idUsers}) no tiene un idRole asignado (valor: ${user.idRole}).`);
        }

        // --- Lógica de Permisos Efectivos ---
        let effectivePermissionsForFrontend = {};
        if (user.idRole) {
            try {
                console.log(`[AuthService BE] Obteniendo permisos efectivos (formato frontend) para Role ID: ${user.idRole}`);
                const permissionObjectsArray = await getEffectiveKeysByRoleId(user.idRole);

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
                            console.warn("[AuthService BE] (login) Objeto de permiso del repositorio incompleto:", permObject);
                        }
                    });
                } else {
                    console.warn(`[AuthService BE] (login) getEffectiveKeysByRoleId no devolvió un array para Role ID ${user.idRole}. Recibido:`, permissionObjectsArray);
                }
                console.log("[AuthService BE] (login) Permisos para el frontend construidos:", JSON.stringify(effectivePermissionsForFrontend));
            } catch (permError) {
                console.error(`[AuthService BE] (login) Error obteniendo/procesando permisos para Role ID ${user.idRole}:`, permError);
                effectivePermissionsForFrontend = {}; // Mantener vacío si hay error
            }
        } else {
            console.warn(`[AuthService BE] (login) Usuario ${email} no tiene idRole asignado. No se cargarán permisos específicos.`);
        }
        // --- Fin Lógica de Permisos ---

        const payload = {
            id: user.idUsers,
            email: user.email,
            idRole: user.idRole
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log(`[AuthService BE] Token JWT generado para ${email}`);

        return {
          token: token,
          user: {
            id: user.idUsers,
            email: user.email,
            full_name: user.full_name,
            idRole: user.idRole,
            role: userRoleData ? { idRole: userRoleData.idRole, roleName: userRoleData.roleName } : null,
            status: user.status
          },
          effectivePermissions: effectivePermissionsForFrontend,
        };

    } catch (error) {
        console.error("[AuthService BE] ERROR CAPTURADO DENTRO DE authService.login:", error.message); // Loguear el mensaje del error
        console.error("[AuthService BE] Stack del error:", error.stack); // Loguear el stack para más detalle
        throw error; // Re-lanzar para que el controlador lo maneje
    }
};

// --- Resto de tus funciones (forgotPasswordService, verifyCodeService, etc.) ---
// Asegúrate de que también usen `User` y `Role` (si es necesario) de la misma manera.

const forgotPasswordService = async (email) => {
    console.log(`[AuthService BE] Solicitud de olvido de contraseña para: ${email}`);
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error('[AuthService BE] Faltan credenciales de email para forgotPasswordService.');
        throw new Error('La funcionalidad de recuperación no está disponible en este momento.');
    }
     if (!User) { // Chequeo adicional
        console.error('[AuthService BE] forgotPassword: Modelo User no definido.');
        throw new Error('Error de configuración interna.');
    }
    const user = await User.findOne({ where: { email } });
    // ... resto de la función forgotPasswordService ...
    if (!user) {
        console.warn(`[AuthService BE] forgotPassword: Usuario no encontrado para ${email}.`);
         console.log(`[AuthService BE] forgotPassword: No se envía correo porque el usuario ${email} no fue encontrado.`);
        return { message: 'Si tu correo electrónico está registrado en nuestro sistema y se encuentra activo, recibirás un código de recuperación en breve.' };
    }
    if (!user.status) {
        console.warn(`[AuthService BE] forgotPassword: Cuenta inactiva para ${email}.`);
        console.log(`[AuthService BE] forgotPassword: No se envía correo porque la cuenta ${email} está inactiva.`);
        return { message: 'Si tu correo electrónico está registrado en nuestro sistema y se encuentra activo, recibirás un código de recuperación en breve.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    user.resetCode = code;
    user.resetCodeExp = expiration;
    await user.save();
    console.log(`[AuthService BE] Código de reseteo ${code} generado para ${email}. Expira: ${expiration.toISOString()}`);

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Soporte FoodNode" <${EMAIL_USER}>`,
            to: user.email,
            subject: 'Restablecimiento de Contraseña - FoodNode',
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                     <h2>Restablecimiento de Contraseña</h2>
                     <p>Hola ${user.full_name || 'usuario'},</p>
                     <p>Has solicitado restablecer tu contraseña para tu cuenta en FoodNode. Usa el siguiente código de verificación:</p>
                     <p style="font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; margin: 20px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${code}</p>
                     <p>Este código es válido por 10 minutos.</p>
                     <p>Si no solicitaste este cambio, por favor ignora este correo electrónico. Tu contraseña permanecerá sin cambios.</p>
                     <p>Saludos,<br>El equipo de FoodNode</p>
                   </div>`,
        });
        console.log(`[AuthService BE] Email de recuperación enviado a ${email}`);
        return { message: 'Se ha enviado un código de verificación a tu correo electrónico.' };

    } catch (mailError) {
        console.error(`[AuthService BE] Error enviando email de recuperación a ${email}:`, mailError);
        throw new Error('Error interno al intentar enviar el correo de recuperación. Por favor, inténtalo de nuevo más tarde.');
    }
};

const verifyCodeService = async (email, code, newPassword) => {
    console.log(`[AuthService BE] Verificando código ${code} para email: ${email}`);
    if (!User) { // Chequeo adicional
        console.error('[AuthService BE] verifyCode: Modelo User no definido.');
        throw new Error('Error de configuración interna.');
    }
    const user = await User.findOne({ where: { email } });
    // ... resto de la función verifyCodeService ...
    if (!user) {
        console.warn(`[AuthService BE] verifyCode: Usuario no encontrado para ${email}`);
        throw new Error('Usuario no encontrado o código incorrecto.');
    }

    const now = new Date();
    if (user.resetCode !== code || !user.resetCodeExp || new Date(user.resetCodeExp) < now) {
        console.warn(`[AuthService BE] verifyCode: Código inválido o expirado para ${email}. Código en BD: ${user.resetCode}, Expira BD: ${user.resetCodeExp ? new Date(user.resetCodeExp).toISOString() : 'N/A'}, Ahora: ${now.toISOString()}`);
        user.resetCode = null;
        user.resetCodeExp = null;
        await user.save();
        throw new Error('El código de verificación es inválido, ha expirado o ya fue utilizado.');
    }

    console.log(`[AuthService BE] Código ${code} verificado para ${email}. Actualizando contraseña...`);
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExp = null;

    await user.save();
    console.log(`[AuthService BE] Contraseña actualizada y código limpiado para ${email}`);

    return { message: 'Tu contraseña ha sido restablecida exitosamente.' };
};

const getEffectivePermissionsForRole = async (roleId) => {
    console.log(`[AuthService BE] (getEffectivePermissionsForRole) Obteniendo permisos efectivos para Role ID: ${roleId}`);
    let effectivePermissionsForFrontend = {};
    if (!roleId) {
        console.warn("[AuthService BE] (getEffectivePermissionsForRole) Se requiere roleId.");
        return {};
    }
    try {
        const permissionObjectsArray = await getEffectiveKeysByRoleId(roleId);
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
                }
            });
        } else {
             console.warn(`[AuthService BE] (getEffectivePermissionsForRole) getEffectiveKeysByRoleId no devolvió un array para Role ID ${roleId}. Recibido:`, permissionObjectsArray);
        }
        console.log("[AuthService BE] (getEffectivePermissionsForRole) Permisos construidos para Role ID "+ roleId +":", JSON.stringify(effectivePermissionsForFrontend));
        return effectivePermissionsForFrontend;
    } catch (permError) {
        console.error(`[AuthService BE] (getEffectivePermissionsForRole) Error obteniendo/procesando permisos para Role ID ${roleId}:`, permError);
        return {};
    }
};

module.exports = {
    login,
    forgotPasswordService,
    verifyCodeService,
    getEffectivePermissionsForRole
};