// config/database.js (VERSIÓN FINAL PARA VERCEL)

const { Sequelize } = require("sequelize");

const path = require('path');

// Cargar variables desde .env.local si estamos en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

// Verificación de variables (reutilizamos la lógica)
const requiredEnvVars = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_PORT'
];
// En producción, también requerimos el certificado CA.
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('AIVEN_DB_CA');
}

for (const varName of requiredEnvVars) {
  if (process.env[varName] === undefined) {
    throw new Error(`config/database.js: La variable de entorno requerida '${varName}' no está definida.`);
  }
}

// Configuración de SSL solo para producción
const dialectOptions = process.env.NODE_ENV === 'production'
  ? {
      ssl: {
        ca: process.env.AIVEN_DB_CA,
        rejectUnauthorized: true,
      },
    }
  : {}; // En desarrollo, es un objeto vacío

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectModule: require('mysql2'), // Lo dejamos para ambos entornos por consistencia
    logging: false,
    dialectOptions, // Aplicamos las opciones de SSL
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