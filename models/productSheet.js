const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductSheet = sequelize.define(
  "ProductSheet",
  {
    idProductSheet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idSpecSheet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idSupplier: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "productSheets",
    timestamps: true,
  }
);

// Las asociaciones se definirán después de exportar
module.exports = ProductSheet;

// Importar los modelos después para evitar dependencias circulares
const SpecSheet = require("./specSheet");
const Supplier = require("./supplier");

// Definir asociaciones
ProductSheet.belongsTo(SpecSheet, {
  foreignKey: "idSpecSheet",
  as: "SpecSheet",
});

ProductSheet.belongsTo(Supplier, {
  foreignKey: "idSupplier",
  as: "Supplier",
});
