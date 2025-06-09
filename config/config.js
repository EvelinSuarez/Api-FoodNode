// config/config.js

// Carga las variables de entorno desde tu archivo .env
require('dotenv').config();

// Creamos un objeto URL a partir de tu variable de entorno MYSQL_URL.
const url = new URL(process.env.MYSQL_URL);

module.exports = {
  // Configuración para el entorno de DESARROLLO (el que usa la CLI por defecto)
  development: {
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // .slice(1) para quitar la '/' inicial
    host: url.hostname,
    port: url.port,
    dialect: 'mysql'
  },

  // Configuración para el entorno de PRODUCCIÓN
  production: {
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    host: url.hostname,
    port: url.port,
    dialect: 'mysql'
  }
};