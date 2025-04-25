// encryptPassword.js
const bcrypt = require('bcryptjs');

// Cambia esta contraseña por la que quieras encriptar
const plainPassword = 'admin12345';

// Opcional: puedes cambiar el número de saltos (más alto = más seguro pero más lento)
const saltRounds = 10;

async function encryptPassword(password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Contraseña encriptada:');
    console.log(hash);
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error.message);
  }
}

// Ejecutamos
encryptPassword(plainPassword);
