const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");

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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "SpecSheets", // Asegúrate de que el nombre de la tabla sea correcto
  }
);

// Definir relaciones
SpecSheet.belongsTo(Product, { 
  foreignKey: "idProduct",
  as: "Product" 
});
Product.hasMany(SpecSheet, { foreignKey: "idProduct" });

// Exportar para poder importar en ProductSheet
module.exports = SpecSheet;
