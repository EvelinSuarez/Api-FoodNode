// models/index.js (Adaptado a modelos que exportan la CLASE inicializada)
'use strict';

const { Sequelize } = require('sequelize'); // Solo se necesita Sequelize aquí
// Importa la instancia de sequelize desde tu archivo de configuración
const sequelize = require('../config/database'); // <= ¡Asegúrate que la ruta sea correcta!
const db = {}; // Objeto para guardar modelos y la instancia

// *** SIMPLEMENTE IMPORTA LOS MODELOS YA INICIALIZADOS ***
// Asume que cada archivo (provider.js, etc.) importa sequelize y exporta el modelo final
db.Provider = require('./provider');
db.Supplier = require('./supplier');
db.RegisterPurchase = require('./registerPurchase');
db.PurchaseDetail = require('./purchaseDetail');

// --- Definir Asociaciones (Tu código existente) ---
// Accede a los modelos directamente desde el objeto db
const { Provider, Supplier, RegisterPurchase, PurchaseDetail } = db;

// Proveedor <-> RegistroCompra
Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
RegisterPurchase.belongsTo(Provider, { foreignKey: 'idProvider', as: 'provider' });

// RegistroCompra <-> DetalleCompra
RegisterPurchase.hasMany(PurchaseDetail, { foreignKey: { name: 'idRegisterPurchase', allowNull: false }, as: 'details', onDelete: 'CASCADE' });
PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: 'idRegisterPurchase', as: 'purchase' });

// Supplier (Insumo) <-> DetalleCompra
Supplier.hasMany(PurchaseDetail, { foreignKey: { name: 'idSupplier', allowNull: false }, as: 'purchaseOccurrences' });
PurchaseDetail.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'insumo' });

// --- Fin Asociaciones ---

// Adjunta la instancia importada y la clase Sequelize al objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exporta el objeto 'db'
module.exports = db;