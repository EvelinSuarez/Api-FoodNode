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

// --- Compras (RegisterPurchase, PurchaseDetail) ---
// Un Proveedor (Provider) real tiene muchas Compras Registradas
db.Provider.hasMany(db.RegisterPurchase, { foreignKey: 'idProvider', as: 'purchases' });
db.RegisterPurchase.belongsTo(db.Provider, { foreignKey: 'idProvider', as: 'provider' });

// Una Compra Registrada tiene muchos Detalles de Compra
db.RegisterPurchase.hasMany(db.PurchaseDetail, { foreignKey: 'idRegisterPurchase', as: 'details', onDelete: 'CASCADE' });
db.PurchaseDetail.belongsTo(db.RegisterPurchase, { foreignKey: 'idRegisterPurchase', as: 'purchase' });

// Un Detalle de Compra se refiere a un InsumoMaestro (Supplier)
// ESTA ES LA RELACIÓN CLAVE: ¿Qué estás comprando? Respuesta: Un InsumoMaestro (Supplier)
db.Supplier.hasMany(db.PurchaseDetail, { foreignKey: 'idSupplier', as: 'purchaseLineItems' }); // Un Insumo puede estar en muchas líneas de compra
db.PurchaseDetail.belongsTo(db.Supplier, { foreignKey: 'idSupplier', as: 'insumoPurchased' }); // Cada línea de compra es de UN Insumo


// --- ProductionOrder y sus relaciones ---
db.ProductionOrder.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'productOrdered' }); // El producto final a producir
db.ProductionOrder.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' }); // La ficha técnica usada

// La siguiente relación de ProductionOrder con ProcessDetail debe ser revisada.
// Si ProcessDetail es la tabla de unión para SpecSheet <-> Process, entonces ProductionOrder no debería tener hasMany ProcessDetail
// a menos que ProcessDetail también tenga una FK a ProductionOrder (lo cual lo haría complejo).
// Es más común que ProductionOrder tenga sus propios "Pasos de Ejecución" que podrían referenciar a ProcessDetail o Process.
// Por ahora, la mantendré como la tienes, pero podría ser un punto de refactorización.
db.ProductionOrder.hasMany(db.ProcessDetail, { foreignKey: 'idProductionOrder', as: 'productionSteps' }); // Renombrado 'steps' a 'productionSteps'
db.ProcessDetail.belongsTo(db.ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrderInstance' }); // Renombrado


// --- Relaciones de ProcessDetail con Employee ---
// (Manteniendo tus definiciones, asumiendo que ProcessDetail tiene idEmployee)
db.Employee.hasMany(db.ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' });
db.ProcessDetail.belongsTo(db.Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });


// --- Roles, Usuarios, Permisos, Privilegios --- (Manteniendo tus definiciones)
db.Role.hasMany(db.User, { foreignKey: 'idRole', as: 'users' });
db.User.belongsTo(db.Role, { foreignKey: 'idRole', as: 'role' });

db.Role.belongsToMany(db.Permission, { through: db.RolePrivilege, foreignKey: 'idRole', otherKey: 'idPermission', as: 'permissions' });
db.Permission.belongsToMany(db.Role, { through: db.RolePrivilege, foreignKey: 'idPermission', otherKey: 'idRole', as: 'rolesWithPermission' });

db.Role.belongsToMany(db.Privilege, { through: db.RolePrivilege, foreignKey: 'idRole', otherKey: 'idPrivilege', as: 'privileges' });
db.Privilege.belongsToMany(db.Role, { through: db.RolePrivilege, foreignKey: 'idPrivilege', otherKey: 'idRole', as: 'rolesWithPrivilege' });


// Sincronización y exportación
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Llamar a los métodos associate si existen
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;