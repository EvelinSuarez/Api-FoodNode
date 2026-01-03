const { Sequelize } = require("sequelize");
const path = require("path");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

if (!process.env.DATABASE_URL) {
  throw new Error("La variable de entorno DATABASE_URL no está definida.");
}

const dialectOptions = {};
if (process.env.NODE_ENV === 'production') {
  dialectOptions.ssl = {
    rejectUnauthorized: false // Esto permite que Render acepte el certificado de Aiven
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql", // O 'postgres'
  dialectModule: require("mysql2"),
  logging: false,
  dialectOptions,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;