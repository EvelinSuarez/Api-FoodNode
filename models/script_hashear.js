// script_hashear.js
const bcrypt = require('bcryptjs');
const passwordPlana = '1015Dsuarez'; // ¡CAMBIA ESTA CONTRASEÑA!
bcrypt.hash(passwordPlana, 10).then(hash => console.log(hash));
// Ejecuta: node script_hashear.js
// Copia el hash que imprime