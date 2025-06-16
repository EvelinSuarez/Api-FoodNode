// config/config.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// --- Ruta al certificado CA ---
// Construye la ruta al archivo ca.pem que debe estar en esta misma carpeta (config/)
const caPath = path.join(__dirname, 'ca.pem');

// --- Verificación Crítica ---
// Si el archivo ca.pem no existe, sequelize-cli fallará.
// Este error es más claro que el que daría Sequelize.
if (!fs.existsSync(caPath)) {
    throw new Error(`ERROR CRÍTICO: El archivo del certificado 'ca.pem' no se encuentra en la carpeta 'config'. Descárgalo desde Aiven y colócalo aquí antes de ejecutar migraciones.`);
}

// Leemos el contenido del certificado una sola vez para usarlo en ambas configuraciones.
const caCert = fs.readFileSync(caPath);

module.exports = {
  /**
   * Configuración para el entorno de DESARROLLO.
   * Lee las variables de tu archivo .env para conectarse a Aiven.
   */
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        // Usamos 'true' porque estamos proveyendo el certificado CA correcto.
        // Esto es más seguro que 'false'.
        rejectUnauthorized: true, 
        ca: caCert
      }
    }
  },

  /**
   * Configuración para el entorno de PRODUCCIÓN.
   * Por ahora, la configuramos igual que la de desarrollo, apuntando a Aiven.
   * Cuando despliegues tu app, las variables de entorno vendrán de tu proveedor de hosting.
   */
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: caCert
      }
    }
  }
};