// config/database.js (VERSIÓN FINAL PARA VERCEL)

const { Sequelize } = require("sequelize");
const mysql2 = require('mysql2'); // Importamos mysql2 explícitamente
require("dotenv").config();

// --- Verificación de variables de entorno ---
const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_PORT',
    'AIVEN_DB_CA' // Añadimos la nueva variable del certificado
];

for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        // Este error solo se mostrará en local si falta algo en .env
        // En Vercel, si falta una variable, el build fallará, lo cual es bueno.
        throw new Error(`ERROR: La variable de entorno ${varName} no está definida.`);
    }
}

// --- Configuración de Sequelize ---
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        // SOLUCIÓN PARA MYSQL2: Pasamos el módulo directamente
        dialectModule: mysql2,
        logging: false,

        // Opciones específicas del dialecto para la conexión SSL
        dialectOptions: {
            ssl: {
                // SOLUCIÓN PARA SSL: Usamos el certificado desde la variable de entorno
                ca: process.env.AIVEN_DB_CA,
                rejectUnauthorized: true, // Esto es correcto, mantenlo así.
            },
        },
        
        // Es buena práctica añadir configuración de pool en producción
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// --- Función para probar la conexión (Opcional en producción, pero útil) ---
// La dejamos como está, si falla, se verá en los logs de Vercel.
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ INFO: Conexión a la base de datos de Aiven establecida exitosamente.");
    } catch (error) {
        // En Vercel, este error hará que la función serverless falle, lo cual es el comportamiento esperado.
        console.error("❌ ERROR: No se pudo conectar a la base de datos.", error.message);
        // Lanzamos el error para que el proceso falle y Vercel lo reporte.
        throw new Error("Fallo en la conexión a la base de datos."); 
    }
}

testConnection();

module.exports = sequelize;