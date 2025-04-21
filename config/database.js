// const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize('food_node', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql'
// });

// module.exports = sequelize;

// config/database.js (Usando parámetros directos)
const { Sequelize } = require('sequelize');

// Define la conexión directamente aquí
const sequelize = new Sequelize('food_node', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
    // Puedes añadir otras opciones de Sequelize aquí si las necesitas
    // logging: false, // Por ejemplo, para desactivar los logs SQL
});

// Exporta la instancia creada
module.exports = sequelize;     