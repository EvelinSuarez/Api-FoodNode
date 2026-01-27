const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
}

// Configuración base
const config = {
  dialect: 'mysql',
  logging: false,
  dialectModule: require('mysql2'),
};

module.exports = {
  development: {
    ...config,
    // En local usualmente NO usamos DATABASE_URL, sino variables separadas
    // o una URL que no requiera SSL.
    url: process.env.DATABASE_URL,
    dialectOptions: {
      // Solo activamos SSL si la URL no es de localhost
      ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1') 
        ? { rejectUnauthorized: false } 
        : false
    }
  },
  test: {
    ...config,
    url: process.env.DATABASE_URL,
  },
  production: {
    ...config,
    url: process.env.DATABASE_URL,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
};