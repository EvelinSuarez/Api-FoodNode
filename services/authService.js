const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// 🔹 Verificar si el secreto se está cargando correctamente
console.log("🔹 JWT_SECRET en authService:", JWT_SECRET);

const login = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    include: { model: Role,},

  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  const token = jwt.sign(
    { id: user.idUsers, email: user.email, role: user.idRole },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  console.log("🔹 Token generado:", token);

  return {
    user: { idUsers: user.idUsers, email: user.email, role: user.idRole },
    token,
  };
};

module.exports = { login };
