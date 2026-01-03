const path = require('path');

// En desarrollo buscamos el .env.local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

const config = {
  use_env_variable: 'DATABASE_URL', // Render nos dará esta variable
  dialect: 'mysql', // Cambia a 'postgres' si usas la DB nativa de Render
  logging: false,
  dialectModule: require('mysql2'),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false // Requerido para conexiones seguras en la nube
    }
  }
};

module.exports = {
  development: { ...config, use_env_variable: undefined, url: process.env.DATABASE_URL },
  test: { ...config },
  production: { ...config }
};