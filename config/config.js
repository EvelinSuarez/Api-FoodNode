require('dotenv').config();
const fs = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL === '1'; // Vercel inyecta esta variable automáticamente

// Si estamos en Vercel, usamos el CA desde variable de entorno
const caCert = isVercel
  ? Buffer.from(process.env.DB_CA, 'base64').toString('utf-8')
  : fs.readFileSync(path.join(__dirname, 'ca.pem'));

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: caCert
      }
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: caCert
      }
    }
  }
};
