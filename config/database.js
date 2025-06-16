// config/database.js
const { Sequelize } = require("sequelize");
const fs = require("fs"); // Módulo para leer archivos del sistema
const path = require("path"); // Módulo para manejar rutas de archivos
require("dotenv").config();

// --- Verificación de variables de entorno ---
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_PORT'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        throw new Error(`ERROR: La variable de entorno ${varName} no está definida. Revisa tu archivo .env`);
    }
}

// --- Ruta al certificado CA ---
// Construye la ruta al archivo ca.pem que debe estar en esta misma carpeta (config/)
const caPath = path.join(__dirname, 'ca.pem');

// Verifica si el certificado existe antes de intentar conectarse
if (!fs.existsSync(caPath)) {
    throw new Error(`ERROR: El archivo del certificado 'ca.pem' no se encuentra en la carpeta 'config'. Descárgalo desde la consola de Aiven.`);
}

// --- Configuración de Sequelize ---
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql", // Asegúrate de que tu base de datos en Aiven sea MySQL
        logging: false, // Ponlo en 'console.log' para ver las queries en la terminal

        // Opciones específicas del dialecto para la conexión SSL
        dialectOptions: {
            ssl: {
                // Indica que SSL es requerido
                require: true, 
                // Evita errores de "self-signed certificate" proveyendo el CA de Aiven
                rejectUnauthorized: true, 
                // Lee el archivo del certificado que descargaste
                ca: fs.readFileSync(caPath).toString(),
            },
        },
    }
);

// --- Función para probar la conexión ---
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ INFO: Conexión a la base de datos de Aiven establecida exitosamente.");
    } catch (error) {
        console.error("❌ ERROR: No se pudo conectar a la base de datos. Revisa tus credenciales, la configuración de SSL y que el servicio en Aiven esté activo.", error);
    }
}

testConnection();

module.exports = sequelize;