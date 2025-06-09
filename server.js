// server.js (Versión Corregida)

const app = require('./app');
const sequelize = require('./config/database');
const db = require('./models'); // <-- CAMBIO 1: No uses llaves {}
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('INFO: Conexión a la base de datos establecida exitosamente.');

    // CAMBIO 2: Ahora 'db' es el objeto correcto que contiene 'sequelize'
    await db.sequelize.sync({ force: false, alter: false });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    // Si el error persiste, podemos registrar más detalles
    console.error('ERROR: No se pudo conectar o sincronizar la base de datos:', error);
    process.exit(1);
  }
};

startServer();