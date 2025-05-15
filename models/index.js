'use strict';

const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const db = {};

// Carga de modelos
db.Provider = require('./provider');
db.Supplier = require('./supplier');
db.RegisterPurchase = require('./registerPurchase');
db.PurchaseDetail = require('./purchaseDetail');
db.Role = require('./role');
db.User = require('./user');
db.Permission = require('./permission');
db.Privilege = require('./privilege');
db.RolePrivilege = require('./rolePrivileges');

// Extraer modelos para uso en asociaciones
const {
    Provider, Supplier, RegisterPurchase, PurchaseDetail,
    Role, User, Permission, Privilege, RolePrivilege
} = db;

// --- Asociaciones: Compras ---
Provider.hasMany(RegisterPurchase, {
    foreignKey: { name: 'idProvider', allowNull: false },
    as: 'purchases'
});
RegisterPurchase.belongsTo(Provider, {
    foreignKey: 'idProvider',
    as: 'provider'
});

RegisterPurchase.hasMany(PurchaseDetail, {
    foreignKey: { name: 'idRegisterPurchase', allowNull: false },
    as: 'details',
    onDelete: 'CASCADE'
});
PurchaseDetail.belongsTo(RegisterPurchase, {
    foreignKey: 'idRegisterPurchase',
    as: 'purchase'
});

Supplier.hasMany(PurchaseDetail, {
    foreignKey: { name: 'idSupplier', allowNull: false },
    as: 'purchaseOccurrences'
});
PurchaseDetail.belongsTo(Supplier, {
    foreignKey: 'idSupplier',
    as: 'insumo'
});

// --- Asociaciones: Roles y Usuarios ---
Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });

// --- Asociaciones: Roles con Permisos y Privilegios (sin belongsToMany duplicado) ---
// Las relaciones están definidas dentro de rolePrivileges.js con belongsTo / hasMany

// Agrega instancias a db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
