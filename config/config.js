// config/config.js (VERSIÓN FINAL PARA VERCEL)
// Este archivo es SOLO para el `sequelize-cli`.

// NO USAR DOTENV AQUÍ. Las variables vienen del entorno de Vercel.
// require('dotenv').config(); // <-- ELIMINA O COMENTA ESTA LÍNEA

module.exports = {
  // El entorno de desarrollo local sigue funcionando igual.
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  },
  
  // El entorno de test no lo usamos, pero lo dejamos por si acaso.
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  },
  
  // ESTE ES EL ENTORNO CRÍTICO QUE USA VERCEL
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    // Añadimos la configuración de SSL y dialectModule aquí también
    dialectModule: require('mysql2'), // Le pasamos el driver manualmente
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        // Leemos el certificado desde la variable de entorno
        ca: process.env.AIVEN_DB_CA,
      },
    },
  },
};