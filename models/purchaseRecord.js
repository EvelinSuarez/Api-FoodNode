const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./provider'); // Asegúrate de tener el modelo de Provider

const PurchaseRecord = sequelize.define('PurchaseRecord', {
    idPurchaseRecord: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    idProvider: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: Provider, 
            key: 'idProvider' 
        }
    },
    purchaseDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    state: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

// Relación de PurchaseRecord con Provider (un registro de compra pertenece a un proveedor)
PurchaseRecord.belongsTo(Provider, { foreignKey: 'idProvider' });
// Un proveedor puede tener muchos registros de compra
Provider.hasMany(PurchaseRecord, { foreignKey: 'idProvider' });

module.exports = PurchaseRecord;
