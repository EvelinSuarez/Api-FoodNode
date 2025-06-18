// config/config.js (VERSIÓN HÍBRIDA FINAL: LOCAL + VERCEL)

const path = require('path');

// Cargar variables desde .env.local si estamos en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

// Verificación de variables para asegurar que todo está configurado
// Si algo falta, el proceso se detendrá con un error claro.
const requiredEnvVars = [
  'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_HOST', 'DB_PORT'
];
// En producción, también requerimos el certificado CA.
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('AIVEN_DB_CA');
}

for (const varName of requiredEnvVars) {
  if (process.env[varName] === undefined) {
    throw new Error(`config/config.js: La variable de entorno requerida '${varName}' no está definida.`);
  }
}

// --- Configuración base para todos los entornos ---
// Esto evita repetir código.
const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
};

// --- Exportación final de los entornos ---
module.exports = {
  development: {
    // En desarrollo, usamos la configuración base.
    ...baseConfig,
  },
  test: {
    // El entorno de test usa la misma configuración base.
    ...baseConfig,
  },
  production: {
    // En producción, tomamos la base y añadimos la configuración SSL.
    ...baseConfig,
    dialectModule: require('mysql2'), // Carga manual del driver
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: process.env.AIVEN_DB_CA,
      },
    },
  },
};