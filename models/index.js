'use strict';

const { Sequelize, DataTypes } = require('sequelize');
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
db.Provider = require('./provider');
db.Product = require('./Product');
db.SpecSheet = require('./specSheet');
db.ProductSheet = require('./productSheet');
db.Supplier = require('./supplier');
db.ProductionOrder = require('./productionOrder');
db.Employee = require('./employee');
db.Process = require('./process');
db.ProcessDetail = require('./processDetail');
   

// Extraer modelos para uso en asociaciones
const {
    Provider, Supplier, RegisterPurchase, PurchaseDetail,
    Role, User, Permission, Privilege, RolePrivilege, Product, SpecSheet, ProductSheet, ProductionOrder, Employee, Process, ProcessDetail
} = db;

// Product <-> SpecSheet (Relación Uno-a-Muchos directa)
Product.hasMany(SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
SpecSheet.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });

// SpecSheet <-> ProductSheet (Ingredientes de la Ficha)
SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet', as: 'ProductSheets' }); // o 'productSheetItems'
ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });

// Supplier <-> ProductSheet (Proveedor del Ingrediente)
Supplier.hasMany(ProductSheet, { foreignKey: 'idSupplier', as: 'supplierIngredients' });
ProductSheet.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'supplier' });

// ProductionOrder relaciones
ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'productOrdered' }); // 'product' ya usado

ProductionOrder.hasMany(db.ProcessDetail ,{ foreignKey: 'idProductionOrder', as: 'steps' });

// ProcessDetail relaciones
db.ProcessDetail.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
db.ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcess' });
db.ProcessDetail.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'relatedSpecSheet' }); // 'specSheet' ya usado
db.ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });


// Employee relaciones
Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' }); // 'assignedProcessDetails' ya usado

// Tus asociaciones existentes (asegúrate que usen los modelos de 'db' o los desestructurados)
Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });


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

// --- Asociaciones: Roles con Permisos y Privilegios (muchos a muchos) ---
// Role <-> Permission
Role.belongsToMany(Permission, {
    through: RolePrivilege,
    foreignKey: 'idRole',
    otherKey: 'idPermission',
    as: 'permissions'
});
Permission.belongsToMany(Role, {
    through: RolePrivilege,
    foreignKey: 'idPermission',
    otherKey: 'idRole',
    as: 'rolesWithPermission'
});

// Role <-> Privilege
Role.belongsToMany(Privilege, {
    through: RolePrivilege,
    foreignKey: 'idRole',
    otherKey: 'idPrivilege',
    as: 'privileges'
});
Privilege.belongsToMany(Role, {
    through: RolePrivilege,
    foreignKey: 'idPrivilege',
    otherKey: 'idRole',
    as: 'rolesWithPrivilege'


});
if (db.ProductionOrder && db.Product) {
    console.log("Definiendo ProductionOrder.belongsTo(Product)");
    db.ProductionOrder.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'product' });
} else {
    console.error("Error al definir ProductionOrder -> Product: Modelos no listos.");
    if(!db.ProductionOrder) console.error("db.ProductionOrder es undefined");
    if(!db.Product) console.error("db.Product es undefined");
}

if (db.ProductionOrder && db.SpecSheet) {
    console.log("Definiendo ProductionOrder.belongsTo(SpecSheet)");
    db.ProductionOrder.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' });
} else {
    console.error("Error al definir ProductionOrder -> SpecSheet: Modelos no listos.");
    if(!db.ProductionOrder) console.error("db.ProductionOrder es undefined");
    if(!db.SpecSheet) console.error("db.SpecSheet es undefined");
}

console.log("\n--- ANTES de ProductionOrder.hasMany(ProcessDetail) ---");

console.log("Verificando db.ProductionOrder:");
if (db.ProductionOrder) {
    console.log("  Tipo:", typeof db.ProductionOrder);
    console.log("  Nombre del Modelo:", db.ProductionOrder.name);
    console.log("  Es instancia de Sequelize.Model:", db.ProductionOrder instanceof Sequelize.Model);
    console.log("  Tiene método hasMany:", typeof db.ProductionOrder.hasMany === 'function');
} else {
    console.log("  db.ProductionOrder es UNDEFINED");
}

console.log("Verificando db.ProcessDetail:"); // <--- ¡USA db.ProcessDetail AQUÍ!
if (db.ProcessDetail) {
    console.log("  Tipo:", typeof db.ProcessDetail);
    console.log("  Nombre del Modelo:", db.ProcessDetail.name);
    console.log("  Es instancia de Sequelize.Model:", db.ProcessDetail instanceof Sequelize.Model);
} else {
    console.log("  db.ProcessDetail es UNDEFINED");
}
console.log("----------------------------------------------------");

// Línea 113 o la del error:
if (db.ProductionOrder && db.ProductionOrder.hasMany && db.ProcessDetail instanceof Sequelize.Model) {
    db.ProductionOrder.hasMany(db.ProcessDetail, { foreignKey: 'idProductionOrder', as: 'steps' });
    console.log("Asociación ProductionOrder.hasMany(ProcessDetail) definida con ÉXITO.");
} else {
    console.error("FALLO al definir ProductionOrder.hasMany(ProcessDetail).");
    // ... (más logs detallados de por qué falló, como te mostré antes)
}
// No olvides las asociaciones inversas también para Product, SpecSheet, ProcessDetail si las necesitas
// Por ejemplo, en la sección de Product:
if (db.Product && db.ProductionOrder) {
    console.log("Definiendo Product.hasMany(ProductionOrder)");
    db.Product.hasMany(db.ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrders' });
};


// Agrega instancias a db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
