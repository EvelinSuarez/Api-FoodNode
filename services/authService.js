// === VERSIÓN CORREGIDA - 2024-06-10 11:00 AM ===
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Importación de modelos desde el index
const { user: User, role: Role } = require("../models");

// Repositorio para obtener permisos
const { getEffectiveKeysByRoleId } = require('../repositories/rolePrivilegesRepository');

// Carga de variables de entorno
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Verificaciones de configuración al inicio
if (!JWT_SECRET) {
  console.error("❌ ERROR CRÍTICO: JWT_SECRET no está definido.");
  throw new Error("Falta configuración crítica del servidor.");
}
if (!User) {
    console.error("❌ ERROR CRÍTICO: El modelo User no se pudo importar.");
    throw new Error("Error en la configuración de modelos.");
}


const login = async (email, password) => {
    console.log(">>>>>>>> EJECUTANDO LA VERSIÓN MÁS RECIENTE DEL CÓDIGO DE LOGIN <<<<<<<<");
    console.log(`[AuthService BE] 1. Intento de login para: ${email}`);

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`[AuthService BE] Usuario no encontrado para el email: ${email}`);
            throw new Error("Credenciales inválidas o usuario no registrado.");
        }
        
        // CORRECCIÓN 1: Usar el nombre de columna correcto para el log.
        console.log(`[AuthService BE] Usuario encontrado. ID: ${user.idUser}, RoleID: ${user.idRole}`);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.warn(`[AuthService BE] Contraseña incorrecta para el email: ${email}`);
          throw new Error("Credenciales inválidas o usuario no registrado.");
        }

        if (!user.status) {
            console.warn(`[AuthService BE] Intento de login para usuario inactivo: ${email}`);
            throw new Error('Su cuenta de usuario se encuentra inactiva. Contacte al administrador.');
        }

        // --- Lógica de Permisos Efectivos ---
        let effectivePermissions = {};
        if (user.idRole) {
            try {
                const permissionObjectsArray = await getEffectiveKeysByRoleId(user.idRole);
                if (Array.isArray(permissionObjectsArray)) {
                    permissionObjectsArray.forEach(perm => {
                        if (perm.permissionKey && perm.privilegeKey) {
                            if (!effectivePermissions[perm.permissionKey]) {
                                effectivePermissions[perm.permissionKey] = [];
                            }
                            effectivePermissions[perm.permissionKey].push(perm.privilegeKey);
                        }
                    });
                }
            } catch (permError) {
                console.error(`[AuthService BE] Error obteniendo permisos para Role ID ${user.idRole}:`, permError);
                // Dejar los permisos vacíos si hay un error para no bloquear el login
            }
        }

        // --- Payload para el Token JWT ---
        const payload = {
            id: user.idUser, // CORRECCIÓN 2: Usar idUser (singular)
            email: user.email,
            idRole: user.idRole
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log(`[AuthService BE] Token JWT generado para ${email}`);

        // --- Objeto final para la respuesta ---
        return {
          token: token,
          user: {
            id: user.idUser,      // CORRECCIÓN 3: Usar idUser (singular)
            email: user.email,
            full_name: user.full_name,
            idRole: user.idRole,
            status: user.status
          },
          effectivePermissions: effectivePermissions,
        };

    } catch (error) {
        console.error("[AuthService BE] Error capturado en la función de login:", error.message);
        // Re-lanzamos el error para que el controlador lo maneje y envíe la respuesta 401
        throw error; 
    }
};

// --- El resto de las funciones (forgotPasswordService, etc.) parecen estar bien ---
// Las incluyo para que tengas el archivo completo y consistente.

const forgotPasswordService = async (email) => {
    // ... (Tu código para esta función ya estaba bien, sin cambios necesarios)
    if (!EMAIL_USER || !EMAIL_PASS) throw new Error('La funcionalidad de recuperación no está disponible.');
    const user = await User.findOne({ where: { email } });
    if (!user || !user.status) {
        console.log(`[AuthService BE] Solicitud de recuperación para email no encontrado o inactivo: ${email}. Se envía respuesta genérica.`);
        return { message: 'Si tu correo electrónico está registrado y activo, recibirás un código.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 10 * 60 * 1000);
    user.resetCode = code;
    user.resetCodeExp = expiration;
    await user.save();
    try {
        const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } });
        await transporter.sendMail({
            from: `"Soporte FoodNode" <${EMAIL_USER}>`,
            to: user.email,
            subject: 'Restablecimiento de Contraseña - FoodNode',
            html: `<div>... (tu HTML del email) ...<p>${code}</p></div>`,
        });
        return { message: 'Se ha enviado un código de verificación a tu correo electrónico.' };
    } catch (mailError) {
        console.error(`[AuthService BE] Error enviando email de recuperación a ${email}:`, mailError);
        throw new Error('Error al intentar enviar el correo de recuperación.');
    }
};

const verifyCodeService = async (email, code, newPassword) => {
    // ... (Tu código para esta función ya estaba bien, sin cambios necesarios)
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado o código incorrecto.');
    const now = new Date();
    if (user.resetCode !== code || !user.resetCodeExp || new Date(user.resetCodeExp) < now) {
        user.resetCode = null; user.resetCodeExp = null; await user.save();
        throw new Error('El código de verificación es inválido o ha expirado.');
    }
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExp = null;
    await user.save();
    return { message: 'Tu contraseña ha sido restablecida exitosamente.' };
};

const getEffectivePermissionsForRole = async (roleId) => {
    // ... (Tu código para esta función ya estaba bien, sin cambios necesarios)
    if (!roleId) return {};
    try {
        const permissionObjectsArray = await getEffectiveKeysByRoleId(roleId);
        let perms = {};
        if (Array.isArray(permissionObjectsArray)) {
            permissionObjectsArray.forEach(p => {
                if (p.permissionKey && p.privilegeKey) {
                    if (!perms[p.permissionKey]) perms[p.permissionKey] = [];
                    perms[p.permissionKey].push(p.privilegeKey);
                }
            });
        }
        return perms;
    } catch (error) {
        console.error(`[AuthService BE] Error en getEffectivePermissionsForRole para Role ID ${roleId}:`, error);
        return {};
    }
};

module.exports = {
    login,
    forgotPasswordService,
    verifyCodeService,
    getEffectivePermissionsForRole
};