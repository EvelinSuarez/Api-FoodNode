const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./provider'); // Modelo de proveedor
const Supplier = require('./supplier');

const RegisterPurchase = sequelize.define('RegisterPurchase', {
    idPurchase: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    idProvider: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: Provider, 
            key: 'idProvider' 
        }
    },
    idSupplier: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: Supplier, 
            key: 'idSupplier' 
        }
    },
    purchaseDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    totalAmount: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

// Relaciones con otros modelos
RegisterPurchase.belongsTo(Provider, { foreignKey: 'idProvider' });
Provider.hasMany(RegisterPurchase, { foreignKey: 'idProvider' });

RegisterPurchase.belongsTo(Supplier, { foreignKey: 'idSupplier' });
Supplier.hasMany(RegisterPurchase, { foreignKey: 'idSupplier' });

module.exports = RegisterPurchase;
