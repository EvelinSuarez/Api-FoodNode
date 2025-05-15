const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Role = require('./role');

const User = sequelize.define('user', {
    idUsers: {
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

    idRole: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'idRole',
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: false,  // Desactivar los campos createdAt y updatedAt
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
  });
  
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = User;
