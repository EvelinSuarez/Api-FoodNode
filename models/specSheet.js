const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SpecSheet = sequelize.define(
  "SpecSheet",
  {
    idSpecsheet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idProduct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "idProduct",
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
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
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'SpecSheets' // Asegúrate de que el nombre de la tabla sea correcto
  }
);

module.exports = SpecSheet;
