// config/config.js - ADAPTADO PARA VARIABLES DE RAILWAY

const path = require('path');

// Cargar variables desde .env.local si estás en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

// Usar las variables que expone Railway
const requiredEnvVars = [
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLDATABASE',
  'MYSQLHOST',
  'MYSQLPORT'
];

for (const varName of requiredEnvVars) {
  if (process.env[varName] === undefined) {
    throw new Error(`config/config.js: La variable de entorno '${varName}' no está definida.`);
  }
}

const baseConfig = {
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  dialect: "mysql",
};

module.exports = {
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
  },
  production: {
    ...baseConfig,
    dialectModule: require('mysql2'),
    dialectOptions: {}, // Railway no requiere SSL
  },
};
