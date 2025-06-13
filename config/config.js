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