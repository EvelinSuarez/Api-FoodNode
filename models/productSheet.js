// models/productSheet.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
// NO necesitas require('./SpecSheet') ni require('./Supplier') aquí

const ProductSheet = sequelize.define(
  "ProductSheet",
  {
    idProductSheet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idSpecSheet: { // FK
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idSupplier: { // FK
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  
  },
  {
    tableName: "productSheets",
    timestamps: true,
  }
);

module.exports = ProductSheet; // SOLO EXPORTA EL MODELO DEFINIDO