const bcrypt = require("bcryptjs"); // Estás usando bcryptjs, lo cual está bien.
const jwt = require("jsonwebtoken"); // ¡CORREGIDO AQUÍ!
const nodemailer = require('nodemailer');
const User = require("../models/user"); // Ajusta si la exportación es directa (ej. si es module.exports = UserDefinition)
const Role = require("../models/role");   // Ajusta si la exportación es directa

// Asegúrate que esta función devuelve: [{ permissionKey: 'roles', privilegeKey: 'view' }, ...]
const { getEffectiveKeysByRoleId } = require('../repositories/rolePrivilegesRepository'); // Verifica esta ruta

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Cambiado a 1h como sugerencia, puedes ajustarlo
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!JWT_SECRET) {
  console.error("❌ ERROR CRÍTICO: JWT_SECRET no está definido en las variables de entorno.");
  // Considera terminar el proceso si es crítico para la seguridad: process.exit(1);
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
      include: [{ model: Role, as: 'role', attributes: ['idRole', 'roleName'] }]
    });

    if (!user) {
      console.warn(`[AuthService BE] Login fallido: Usuario no encontrado para email ${email}`);
      throw new Error("Credenciales inválidas o usuario no registrado.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AuthService BE] Login fallido: Contraseña incorrecta para email ${email}`);
      throw new Error("Credenciales inválidas o usuario no registrado.");
    }

    if (!user.status) {
        console.warn(`[AuthService BE] Login fallido: Usuario inactivo para email ${email}`);
        throw new Error('Su cuenta de usuario se encuentra inactiva. Contacte al administrador.');
    }
    console.log(`[AuthService BE] Usuario ${email} autenticado correctamente (ID: ${user.idUsers}, RoleID: ${user.idRole}).`);

    // --- Lógica de Permisos Efectivos para el Frontend (incluida en la respuesta del login) ---
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
            effectivePermissionsForFrontend = {};
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
    // Ahora jwt.sign debería funcionar porque jwt es el objeto de la librería jsonwebtoken
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log(`[AuthService BE] Token JWT generado para ${email}`);

    return {
      token: token,
      user: {
        id: user.idUsers,
        email: user.email,
        full_name: user.full_name,
        idRole: user.idRole,
        role: user.role ? { idRole: user.role.idRole, roleName: user.role.roleName } : null,
        status: user.status
        // Añade aquí otros campos del usuario que necesites en el frontend:
        // document_type: user.document_type,
        // document: user.document,
        // cellphone: user.cellphone,
      },
      effectivePermissions: effectivePermissionsForFrontend,
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
        throw new Error('Si el correo está registrado y activo, se enviará un código de recuperación.');
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
    console.log(`[AuthService BE] Código de reseteo ${code} generado para ${email}. Expira: ${expiration.toISOString()}`);

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // o tu proveedor de email (ej. SendGrid, Mailgun)
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Soporte NombreApp" <${EMAIL_USER}>`, // Personaliza "NombreApp"
            to: user.email,
            subject: 'Restablecimiento de Contraseña - NombreApp', // Personaliza
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                     <h2>Restablecimiento de Contraseña</h2>
                     <p>Hola ${user.full_name || 'usuario'},</p>
                     <p>Has solicitado restablecer tu contraseña para tu cuenta en NombreApp. Usa el siguiente código de verificación:</p>
                     <p style="font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; margin: 20px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${code}</p>
                     <p>Este código es válido por 10 minutos.</p>
                     <p>Si no solicitaste este cambio, por favor ignora este correo electrónico. Tu contraseña permanecerá sin cambios.</p>
                     <p>Saludos,<br>El equipo de NombreApp</p>
                   </div>`,
        });
        console.log(`[AuthService BE] Email de recuperación enviado a ${email}`);
        return { message: 'Se ha enviado un código de verificación a tu correo electrónico.' };

    } catch (mailError) {
        console.error(`[AuthService BE] Error enviando email de recuperación a ${email}:`, mailError);
        // Aunque el email falle, el código se generó. Podrías tener un mecanismo de reintento o notificar al admin.
        throw new Error('Error interno al intentar enviar el correo de recuperación. Por favor, inténtalo de nuevo más tarde.');
    }
};

const verifyCodeService = async (email, code, newPassword) => {
    console.log(`[AuthService BE] Verificando código ${code} para email: ${email}`);
    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.warn(`[AuthService BE] verifyCode: Usuario no encontrado para ${email}`);
        throw new Error('Usuario no encontrado o código incorrecto.');
    }

    const now = new Date();
    if (user.resetCode !== code || !user.resetCodeExp || new Date(user.resetCodeExp) < now) {
        console.warn(`[AuthService BE] verifyCode: Código inválido o expirado para ${email}.`);
        user.resetCode = null; // Limpiar código inválido/expirado para evitar reintentos con el mismo
        user.resetCodeExp = null;
        await user.save();
        throw new Error('El código de verificación es inválido, ha expirado o ya fue utilizado.');
    }

    console.log(`[AuthService BE] Código ${code} verificado para ${email}. Actualizando contraseña...`);
    user.password = newPassword; // El hook 'beforeUpdate' del modelo User se encargará del hash
    user.resetCode = null;
    user.resetCodeExp = null;

    await user.save();
    console.log(`[AuthService BE] Contraseña actualizada y código limpiado para ${email}`);

    return { message: 'Tu contraseña ha sido restablecida exitosamente.' };
};

const getEffectivePermissionsForRole = async (roleId) => {
    console.log(`[AuthService BE] (Endpoint) Obteniendo permisos efectivos (formato frontend) para Role ID: ${roleId}`);
    let effectivePermissionsForFrontend = {};
    if (!roleId) {
        console.warn("[AuthService BE] (Endpoint) Se requiere roleId para getEffectivePermissionsForRole.");
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
        }
        console.log("[AuthService BE] (Endpoint) Permisos construidos para Role ID "+ roleId +":", JSON.stringify(effectivePermissionsForFrontend));
        return effectivePermissionsForFrontend;
    } catch (permError) {
        console.error(`[AuthService BE] (Endpoint) Error obteniendo/procesando permisos para Role ID ${roleId}:`, permError);
        return {};
    }
};

module.exports = {
    login,
    forgotPasswordService,
    verifyCodeService,
    getEffectivePermissionsForRole
};