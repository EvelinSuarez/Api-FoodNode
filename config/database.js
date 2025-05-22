// config/database.js
const { Sequelize } = require('sequelize');

// Define la conexión directamente aquí
const sequelize = new Sequelize('food_node', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    // logging: false, // <-- Si tenías esto (o similar), coméntalo o cámbialo.

    // ***** CAMBIO PRINCIPAL PARA LA PRUEBA *****
    // Asegúrate de que el logging esté habilitado y use console.log,
    // o simplemente no incluyas la opción 'logging' para que use el default de Sequelize.
    logging: console.log,
    // Alternativamente, puedes borrar la línea de 'logging' completamente para usar el default.
    // *******************************************

    // Aquí puedes añadir otras opciones de Sequelize que puedas necesitar en el futuro,
    // como la configuración del pool de conexiones:
    /*
    pool: {
        max: 5,     // Número máximo de conexiones en el pool
        min: 0,     // Número mínimo de conexiones en el pool
        acquire: 30000, // Tiempo máximo, en milisegundos, que el pool intentará obtener una conexión antes de lanzar un error
        idle: 10000     // Tiempo máximo, en milisegundos, que una conexión puede estar inactiva antes de ser liberada
    }
    */
});

// Prueba de conexión (opcional pero recomendado para verificar que la BD está accesible al inicio)
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('INFO: Conexión a la base de datos establecida exitosamente.');
    } catch (error) {
        console.error('ERROR: No se pudo conectar a la base de datos:', error);
    }
}
testConnection(); // Llama a la función de prueba

// Exporta la instancia creada
module.exports = sequelize;