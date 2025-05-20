// models/index.js
'use strict';

const { Sequelize, DataTypes } = require('sequelize'); // DataTypes no se usa aquí directamente, pero es bueno tenerlo si se usa
const sequelize = require('../config/database');
const db = {};

// --- 1. Carga de Todos los Modelos ---
db.Role = require('./role');
db.User = require('./user');
db.Permission = require('./permission');
db.Privilege = require('./privilege');
db.RolePrivilege = require('./rolePrivileges'); // Asegúrate que el nombre del archivo y modelo coincidan
db.Provider = require('./provider');
db.Supplier = require('./supplier');
db.RegisterPurchase = require('./registerPurchase');
db.PurchaseDetail = require('./purchaseDetail');
db.Product = require('./Product'); // Product.js o product.js?
db.SpecSheet = require('./specSheet');
db.ProductSheet = require('./productSheet');
db.ProductionOrder = require('./productionOrder');
db.Employee = require('./employee');
db.Process = require('./process');
db.ProcessDetail = require('./processDetail');

// --- 2. Definición Explícita de Asociaciones (Centralizada) ---
const {
    Provider, Supplier, RegisterPurchase, PurchaseDetail,
    Role, User, Permission, Privilege, RolePrivilege, Product, SpecSheet, ProductSheet, ProductionOrder, Employee, Process, ProcessDetail
} = db; // Desestructuración para claridad

// --- Asociaciones: Roles y Usuarios (SOLO UNA VEZ) ---
if (Role && User) {
    console.log("Definiendo asociación Role <-> User");
    Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
} else {
    console.error("MODELOS/INDEX.JS: Modelos Role o User no definidos para asociación.");
}

// --- Asociaciones: Permisos y Privilegios ---
if (Permission && Privilege) {
    console.log("Definiendo asociación Permission <-> Privilege");
    Permission.hasMany(Privilege, { foreignKey: 'idPermission', as: 'privileges' });
    Privilege.belongsTo(Permission, { foreignKey: 'idPermission', as: 'permission' });
} else {
    console.error("MODELOS/INDEX.JS: Modelos Permission o Privilege no definidos.");
}

// --- Asociaciones: Roles, Privilegios y Tabla de Unión RolePrivilege ---
if (Role && Privilege && RolePrivilege) {
    console.log("Definiendo asociaciones para RolePrivilege (Many-to-Many)");
    Role.belongsToMany(Privilege, {
        through: RolePrivilege,
        foreignKey: 'idRole',
        otherKey: 'idPrivilege',
        as: 'assignedPrivileges'
    });
    Privilege.belongsToMany(Role, {
        through: RolePrivilege,
        foreignKey: 'idPrivilege',
        otherKey: 'idRole',
        as: 'assignedToRoles'
    });
    // También las directas a la tabla de unión si las necesitas:
    RolePrivilege.belongsTo(Role, { foreignKey: 'idRole', as: 'roleDetails' }); // Alias diferente
    RolePrivilege.belongsTo(Privilege, { foreignKey: 'idPrivilege', as: 'privilegeDetails' }); // Alias diferente
    Role.hasMany(RolePrivilege, { foreignKey: 'idRole', as: 'rolePrivilegeEntries'}); // Alias único
    Privilege.hasMany(RolePrivilege, { foreignKey: 'idPrivilege', as: 'privilegeInRolesEntries'}); // Alias único
} else {
     console.error("MODELOS/INDEX.JS: Error - Modelos Role, Privilege o RolePrivilege no definidos.");
}


// --- Asociaciones de Producción y Compras ---

// Product <-> SpecSheet
if (Product && SpecSheet) {
    console.log("Definiendo asociación Product <-> SpecSheet");
    Product.hasMany(SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
    SpecSheet.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });
}

// SpecSheet <-> ProductSheet (Ingredientes)
if (SpecSheet && ProductSheet) {
    console.log("Definiendo asociación SpecSheet <-> ProductSheet (ingredients)");
    SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet', as: 'ingredients' });
    ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });
}

// Supplier <-> ProductSheet (Proveedor del Ingrediente)
if (Supplier && ProductSheet) {
    console.log("Definiendo asociación Supplier <-> ProductSheet (supplierIngredients)");
    Supplier.hasMany(ProductSheet, { foreignKey: 'idSupplier', as: 'supplierIngredients' });
    ProductSheet.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'supplier' });
}

// ProductionOrder <-> Product
if (ProductionOrder && Product) {
    console.log("Definiendo asociación ProductionOrder <-> Product (productOrdered)");
    ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'productOrdered' });
    // La inversa Product.hasMany(ProductionOrder)
    Product.hasMany(ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrders' });
}

// ProductionOrder <-> SpecSheet
if (ProductionOrder && SpecSheet) {
    console.log("Definiendo asociación ProductionOrder <-> SpecSheet (specSheetUsed)");
    ProductionOrder.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' });
}

// ProductionOrder <-> ProcessDetail
if (ProductionOrder && ProcessDetail) {
    console.log("Definiendo asociación ProductionOrder <-> ProcessDetail (steps)");
    ProductionOrder.hasMany(ProcessDetail, { foreignKey: 'idProductionOrder', as: 'steps' });
}

// ProcessDetail <-> ProductionOrder (Inversa)
if (ProcessDetail && ProductionOrder) {
    console.log("Definiendo asociación ProcessDetail <-> ProductionOrder (productionOrder)");
    ProcessDetail.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
}

// ProcessDetail <-> Process
if (ProcessDetail && Process) {
    console.log("Definiendo asociación ProcessDetail <-> Process (masterProcess)");
    ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcess' });
}

// ProcessDetail <-> SpecSheet
if (ProcessDetail && SpecSheet) {
    console.log("Definiendo asociación ProcessDetail <-> SpecSheet (relatedSpecSheet)");
    ProcessDetail.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'relatedSpecSheet' });
}

// ProcessDetail <-> Employee
if (ProcessDetail && Employee) {
    console.log("Definiendo asociación ProcessDetail <-> Employee (assignedEmployee)");
    ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });
}

// Employee <-> ProcessDetail (Inversa)
if (Employee && ProcessDetail) {
    console.log("Definiendo asociación Employee <-> ProcessDetail (assignedTasks)");
    Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' });
}

// Provider <-> RegisterPurchase
if (Provider && RegisterPurchase) {
    console.log("Definiendo asociación Provider <-> RegisterPurchase (purchases)");
    Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
    RegisterPurchase.belongsTo(Provider, { foreignKey: 'idProvider', as: 'provider' });
}

// RegisterPurchase <-> PurchaseDetail
if (RegisterPurchase && PurchaseDetail) {
    console.log("Definiendo asociación RegisterPurchase <-> PurchaseDetail (details)");
    RegisterPurchase.hasMany(PurchaseDetail, {
        foreignKey: { name: 'idRegisterPurchase', allowNull: false },
        as: 'details',
        onDelete: 'CASCADE'
    });
    PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: 'idRegisterPurchase', as: 'purchase' });
}

// Supplier <-> PurchaseDetail
if (Supplier && PurchaseDetail) {
    console.log("Definiendo asociación Supplier <-> PurchaseDetail (purchaseOccurrences)");
    Supplier.hasMany(PurchaseDetail, { foreignKey: { name: 'idSupplier', allowNull: false }, as: 'purchaseOccurrences' });
    PurchaseDetail.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'insumoSupplier' }); // Cambiado alias 'insumo' por algo más específico
}

// --- NO MÁS ASOCIACIONES DUPLICADAS AQUÍ ---

// --- 3. Aplicar asociaciones definidas con `associate` en cada modelo (OPCIONAL) ---
// Si todas las asociaciones están arriba, esta sección puede no ser necesaria o
// puede ser para modelos que definen sus propias asociaciones de forma aislada.
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    console.log(`MODELOS/INDEX.JS: Intentando aplicar 'associate' para ${modelName}`);
    db[modelName].associate(db);
  }
});

// --- 4. Exportar ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("MODELOS/INDEX.JS: Modelos y asociaciones configurados.");
module.exports = db;