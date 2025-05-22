// models/index.js
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Tu instancia de Sequelize
const db = {};

// Carga de modelos (asegúrate que las rutas y nombres sean correctos)
db.Product = require('./Product');
db.SpecSheet = require('./specSheet');
db.ProductSheet = require('./productSheet');
db.Supplier = require('./supplier');    
db.Process = require('./process');
db.ProcessDetail = require('./processDetail');
// ... carga todos tus otros modelos de la misma forma ...
db.Provider = require('./provider');
db.RegisterPurchase = require('./registerPurchase');
db.PurchaseDetail = require('./purchaseDetail');
db.Role = require('./role');
db.User = require('./user');
db.Permission = require('./permission');
db.Privilege = require('./privilege');
db.RolePrivilege = require('./rolePrivileges');
db.ProductionOrder = require('./productionOrder');
db.Employee = require('./employee');


// --- Definición de Asociaciones ---

// 1. Product <-> SpecSheet (Un Producto final tiene muchas Fichas Técnicas)
db.Product.hasMany(db.SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
db.SpecSheet.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'product' });

// 2. SpecSheet <-> Supplier (InsumoMaestro) via ProductSheet (Muchos-a-Muchos para Ingredientes)
//    Una Ficha Técnica (SpecSheet) usa muchos InsumosMaestros (Supplier),
//    y un InsumoMaestro (Supplier) puede estar en muchas Fichas Técnicas.
//    ProductSheet es la tabla de unión que contiene cantidad y unidad específica.
db.SpecSheet.belongsToMany(db.Supplier, { // Supplier es tu InsumoMaestro
    through: db.ProductSheet,           // ProductSheet es la tabla de unión
    foreignKey: 'idSpecSheet',          // FK en ProductSheet que apunta a SpecSheet
    otherKey: 'idSupplier',             // FK en ProductSheet que apunta a Supplier (InsumoMaestro)
    as: 'ingredients'                   // Cuando obtienes SpecSheet, sus insumos vendrán como 'ingredients'
});
db.Supplier.belongsToMany(db.SpecSheet, { // InsumoMaestro está en muchas SpecSheets
    through: db.ProductSheet,
    foreignKey: 'idSupplier',
    otherKey: 'idSpecSheet',
    as: 'usedInSpecSheets'
});
// Es buena práctica que ProductSheet también defina sus belongsTo si es un modelo explícito:
// db.ProductSheet.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet' });
// db.ProductSheet.belongsTo(db.Supplier, { foreignKey: 'idSupplier' });


// 3. SpecSheet <-> Process via ProcessDetail (Muchos-a-Muchos para Pasos de Proceso de la Ficha)
//    Una Ficha Técnica (SpecSheet) tiene muchos Pasos de Proceso (Process),
//    y un Proceso maestro puede estar en muchas Fichas Técnicas.
//    ProcessDetail es la tabla de unión que contiene el orden y detalles específicos del proceso para esa ficha.
db.SpecSheet.belongsToMany(db.Process, {
    through: db.ProcessDetail,          // ProcessDetail es la tabla de unión
    foreignKey: 'idSpecSheet',          // FK en ProcessDetail que apunta a SpecSheet
    otherKey: 'idProcess',              // FK en ProcessDetail que apunta a Process (maestro)
    as: 'processes'                     // Cuando obtienes SpecSheet, sus pasos de proceso vendrán como 'processes'
});
db.Process.belongsToMany(db.SpecSheet, {
    through: db.ProcessDetail,
    foreignKey: 'idProcess',
    otherKey: 'idSpecSheet',
    as: 'usedInSpecSheetsForProcess' // Renombrado para evitar conflicto con el 'as' anterior
});
// Asociaciones de ProcessDetail (asegúrate que estas FKs existan en ProcessDetail)
// db.ProcessDetail.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet' });
// db.ProcessDetail.belongsTo(db.Process, { foreignKey: 'idProcess' });


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