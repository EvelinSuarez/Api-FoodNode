// config/config.js

require('dotenv').config();

// Se verifica si la variable de entorno MYSQL_URL existe.
// Si no existe, se lanza un error para detener el proceso,
// ya que la aplicación no puede funcionar sin la base de datos.
if (!process.env.MYSQL_URL) {
  throw new Error("ERROR CRÍTICO: La variable de entorno MYSQL_URL no está definida.");
}

// Parseamos la URL de conexión una sola vez para usarla en ambas configuraciones.
// Si MYSQL_URL no fuera una URL válida, esto también daría un error.
const connectionUrl = new URL(process.env.MYSQL_URL);

module.exports = {
  /**
   * Configuración para el entorno de DESARROLLO (tu máquina local).
   * Lee directamente las partes de la URL de conexión de tu archivo .env.
   */
  development: {
    username: connectionUrl.username,
    password: connectionUrl.password,
    database: connectionUrl.pathname.slice(1), // Elimina la barra inicial "/" del path
    host: connectionUrl.hostname,
    port: connectionUrl.port,
    dialect: 'mysql' // Especifica que estás usando MySQL
  },

  /**
   * Configuración para el entorno de PRODUCCIÓN (Render, Railway, etc.).
   * También se basa en la variable de entorno MYSQL_URL, pero la parsea
   * explícitamente para evitar conflictos con sequelize-cli.
   *
   * NOTA: Esta configuración asume que en Render (o tu plataforma de despliegue)
   * tienes una variable de entorno llamada MYSQL_URL con la URL PÚBLICA de tu base de datos de Railway.
   */
  production: {
    username: connectionUrl.username,
    password: connectionUrl.password,
    database: connectionUrl.pathname.slice(1), // Elimina la barra inicial "/"
    host: connectionUrl.hostname,
    port: connectionUrl.port,
    dialect: 'mysql', // Dialecto explícito y sin ambigüedades
    dialectOptions: {
      // La conexión desde un servicio externo (Render) a una base de datos en otro (Railway)
      // a menudo requiere una conexión segura (SSL).
      ssl: {
        require: true,
        // Usar 'false' puede ser necesario si el certificado de Railway no es verificado por el sistema de Render.
        // Es una solución práctica pero menos segura. Si da problemas de "self-signed certificate", esta es la opción.
        rejectUnauthorized: false
      }
    }
  }
};

// require('dotenv').config(); // Carga las variables del archivo .env

// // Valida que las variables locales existan
// if (!process.env.DB_USER || !process.env.DB_DATABASE || !process.env.DB_HOST) {
//   throw new Error("❌ Faltan variables de entorno locales (DB_USER, DB_DATABASE, DB_HOST). Revisa tu archivo .env");
// }

// module.exports = {
//   // Entorno de desarrollo (el que usarás para la expo)
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'mysql'
//   },

//   // Entorno de producción (para cuando vuelvas a subirlo a la nube)
//   production: {
//     use_env_variable: 'MYSQL_URL',
//     dialect: 'mysql',
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     }
//   }
// };