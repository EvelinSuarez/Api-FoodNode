const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RegisterPurchase = require('./registerPurchase');
const Supplier = require('./supplier');

const PurchaseDetail = sequelize.define('PurchaseDetail', {
    idDetail: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    idPurchase: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { 
            model: RegisterPurchase, 
            key: 'idPurchase' 
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
    quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    unitPrice: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    subtotal: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

// Relaciones
PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: 'idPurchase' });
RegisterPurchase.hasMany(PurchaseDetail, { foreignKey: 'idPurchase' });

PurchaseDetail.belongsTo(Supplier, { foreignKey: 'idSupplier' });
Supplier.hasMany(PurchaseDetail, { foreignKey: 'idSupplier' });

module.exports = PurchaseDetail;
