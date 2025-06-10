// config/config.js

require('dotenv').config();

if (!process.env.MYSQL_URL) {
  throw new Error("La variable de entorno MYSQL_URL no está definida.");
}

const devUrl = new URL(process.env.MYSQL_URL);

module.exports = {
  // Configuración de desarrollo (sin cambios)
  development: {
    username: devUrl.username,
    password: devUrl.password,
    database: devUrl.pathname.slice(1),
    host: devUrl.hostname,
    port: devUrl.port,
    dialect: 'mysql'
  },

  // Configuración de producción
  production: {
    use_env_variable: 'MYSQL_URL',
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true, 
        // --- CAMBIO CLAVE AQUÍ ---
        // Le decimos a Node.js que acepte el certificado autofirmado de Render.
        rejectUnauthorized: false 
      }
    }
  }
};