const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate que la ruta sea correcta

const Supply = sequelize.define('Supply', { // Nombre del modelo en singular: Supply
    idSupply: { // Clave primaria
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    supplyName: { // Nombre del insumo
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    unitOfMeasure: { // Unidad de medida base del insumo (kg, L, unidad)
        type: DataTypes.STRING(50),
        allowNull: false
    },
    lastPrice: {
        type: DataTypes.DECIMAL(10, 2), // Usamos DECIMAL para precisión monetaria
        allowNull: false, // Es mejor que no sea nulo, con un default es suficiente.
        defaultValue: 0.00 // Un valor por defecto seguro
    },

    // =================================================================
    // ===========>      AQUÍ AÑADIMOS EL CAMPO DE STOCK      <===========
    // =================================================================
    stock: {
        type: DataTypes.DECIMAL(10, 3), // DECIMAL para cantidades con decimales (10.5 kg, 2.75 L)
        allowNull: false,
        defaultValue: 0.000,
        comment: 'Cantidad actual del insumo en el inventario.'
    },
    // =================================================================
    // ===========>             FIN DEL CAMPO NUEVO             <===========
    // =================================================================

    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    idProduct: {
        type: DataTypes.INTEGER,
        allowNull: true, // Importante para la flexibilidad, aunque no lo usemos para el stock de compra.
        // Opcional: Si tienes una relación formal definida en otro lado, puedes añadir la referencia aquí
        // references: {
        //   model: 'Products', // Nombre del modelo de Producto
        //   key: 'idProduct'
        // }
    }
}, {
    tableName: 'supplies', // Nombre de la tabla en plural
    timestamps: true
});

module.exports = Supply;