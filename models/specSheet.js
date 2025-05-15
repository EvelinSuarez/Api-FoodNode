// models/specSheet.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// NO necesitas require('./Product') aquí

const SpecSheet = sequelize.define(
  "SpecSheet",
  {
    idSpecsheet: { // Asegúrate que este case sea consistente con tus FKs
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idProduct: { // Esta es la FK
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    measurementUnit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER, // O FLOAT si puede tener decimales
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "specSheets", // Corregido de 'SpecSheets' a 'specSheets' para coincidir con tu modelo ProcessDetail
  }
);

module.exports = SpecSheet; // SOLO EXPORTA EL MODELO DEFINIDO