// config/config.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL ||"mysql://root:IyeOpCkJbPMPWTDZLjXPnROvjeIcvYRM@tramway.proxy.rlwy.net:28699/railway", {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    logging: console.log,
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('INFO: Conexión a la base de datos establecida exitosamente.');
    } catch (error) {
        console.error('ERROR: No se pudo conectar a la base de datos:', error);
    }
}
testConnection(); // Llama a la función de prueba

module.exports = sequelize;




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