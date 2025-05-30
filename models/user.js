const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Role = require('./role'); // Asegúrate que la ruta sea correcta si 'role.js' está en el mismo directorio

const User = sequelize.define('user', { // El nombre del modelo es 'user' (minúscula), la tabla será 'users' por defecto
    idUsers: { // Nota: Sequelize suele preferir camelCase para las claves primarias, como 'idUser' o simplemente 'id'
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    document_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    cellphone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, // Es común que el email también sea único
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetCodeExp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idRole: { // Sequelize crea una columna llamada 'idRole'
      type: DataTypes.INTEGER,
      allowNull: false, // Generalmente un usuario DEBE tener un rol
      references: {
        model: Role, // Esto se refiere al modelo Role importado. Sequelize mapeará a la tabla 'roles'.
        key: 'idRole',
      },
      // No es necesario onDelete aquí si quieres el comportamiento RESTRICT por defecto
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: false,
    tableName: 'users', // Puedes especificar explícitamente el nombre de la tabla si no es 'users'
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    indexes: [ // <--- ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE!
        {
            name: 'idx_users_idRole', // Dale un nombre descriptivo al índice
            fields: ['idRole'],     // La columna (o columnas) a indexar
        },
        // Podrías añadir otros índices aquí si los necesitas, por ejemplo en 'email' si haces muchas búsquedas por email
        // {
        //    name: 'idx_users_email',
        //    fields: ['email'],
        //    unique: true // Si el email debe ser único, el índice único ya está cubierto por la restricción 'unique: true' en la columna
        // }
    ]
  });
  
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// NO necesitas User.belongsTo(Role, ...) aquí si ya lo definiste en models/index.js
// Si lo definiste en models/index.js, esa es la forma centralizada y correcta.

module.exports = User;