// config/database.js - ADAPTADO PARA VARIABLES DE RAILWAY

const { Sequelize } = require("sequelize");
const path = require("path");

// Cargar .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

// Verifica que las variables estén definidas
const requiredEnvVars = [
  'MYSQLHOST',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLDATABASE',
  'MYSQLPORT'
];

for (const varName of requiredEnvVars) {
  if (process.env[varName] === undefined) {
    throw new Error(`config/database.js: La variable de entorno '${varName}' no está definida.`);
  }
}

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
    dialectOptions: {}, // No SSL necesario
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test de conexión (opcional)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ INFO: Conexión a la base de datos de Railway establecida exitosamente.");
  } catch (error) {
    console.error("❌ ERROR: No se pudo conectar a la base de datos.", error.message);
    throw new Error("Fallo en la conexión a la base de datos.");
  }
}

testConnection();

module.exports = sequelize;
