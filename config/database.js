// config/database.js
// const { Sequelize } = require('sequelize');

// // Define la conexión directamente aquí
// const sequelize = new Sequelize(process.env.MYSQL_URL ||"mysql://root:IyeOpCkJbPMPWTDZLjXPnROvjeIcvYRM@tramway.proxy.rlwy.net:28699/railway", {
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

// config/database.js
const { Sequelize } = require('sequelize');

// Define la conexión directamente aquí
const sequelize = new Sequelize('food_node', 'root','', {
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