// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegúrate de que las variables de entorno se carguen

// Verifica que la URL exista
if (!process.env.MYSQL_URL) {
    throw new Error("ERROR: La variable de entorno MYSQL_URL no está definida. Revisa tu archivo .env");
}

// Sequelize se inicializa solo con la URL de conexión
const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false, // Puedes poner console.log para ver las queries SQL
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('INFO: Conexión a la base de datos establecida exitosamente.');
    } catch (error) {
        console.error('ERROR: No se pudo conectar a la base de datos:', error);
    }
}

testConnection();

module.exports = sequelize;

// config/database.js
// const { Sequelize } = require('sequelize');

// // Define la conexión directamente aquí
// const sequelize = new Sequelize('food_node', 'root','', {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false,
//     logging: console.log,
// });

// async function testConnection() {
//     try {
//         await sequelize.authenticate();
//         console.log('INFO: Conexión a la base de datos establecida exitosamente.');
//     } catch (error) {
//         console.error('ERROR: No se pudo conectar a la base de datos:', error);
//     }
// }
// testConnection(); // Llama a la función de prueba

// module.exports = sequelize;