// config/config.js

// Carga las variables de entorno desde tu archivo .env
require('dotenv').config();

// Verifica que la variable de entorno MYSQL_URL exista
if (!process.env.MYSQL_URL) {
  throw new Error("La variable de entorno MYSQL_URL no está definida.");
}

// --- CONFIGURACIÓN DE DESARROLLO (Parseando la URL localmente) ---
// Esto es útil si tu .env local tiene la URL completa y quieres usarla para desarrollo
const devUrl = new URL(process.env.MYSQL_URL);

module.exports = {
  // Configuración para el entorno de DESARROLLO
  development: {
    username: devUrl.username,
    password: devUrl.password,
    database: devUrl.pathname.slice(1), // .slice(1) para quitar la '/' inicial
    host: devUrl.hostname,
    port: devUrl.port,
    dialect: 'mysql'
  },

  // --- CONFIGURACIÓN DE PRODUCCIÓN (Optimizada para Render) ---
  production: {
    // Sequelize usará directamente la variable de entorno que le proporciona Render.
    // Esta es la forma más limpia y recomendada.
    use_env_variable: 'MYSQL_URL',
    dialect: 'mysql',

    // --- CORRECCIÓN CLAVE: AÑADIR OPCIONES DE SSL PARA MYSQL ---
    dialectOptions: {
      ssl: {
        // Render proporciona los certificados, por lo que no necesitas archivos locales.
        // 'Amazon RDS' es el preset correcto para la mayoría de los proveedores, incluido Render.
        // Si esto no funciona, prueba con 'require: true' y 'rejectUnauthorized: false' como en el ejemplo de Postgres.
        require: true,
        rejectUnauthorized: true, // Para MySQL con CAs conocidos, esto es más seguro.
                                  // Si sigue fallando, cambia a `false`.
      }
    }
  }
};