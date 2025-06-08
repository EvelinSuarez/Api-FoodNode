'use strict';

const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const db = {};

// --- PASO 1: Carga DINÁMICA de todos los archivos de modelo ---
// Este bucle ejecuta cada archivo de modelo, lo que llama a `sequelize.define()` en cada uno.
// El objetivo es poblar la instancia `sequelize.models` con todas las definiciones.
console.log("[models/index.js] Iniciando carga de archivos de modelos...");
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    require(path.join(__dirname, file));
    // console.log(`[models/index.js] Archivo de modelo procesado: ${file}`);
  });
console.log("[models/index.js] Todos los archivos de modelo procesados.");

// --- PASO 2: Poblar el objeto 'db' desde la instancia de Sequelize ---
// Ahora que TODOS los modelos han sido definidos, los tomamos de la fuente oficial
// `sequelize.models`. Esto rompe los ciclos de dependencia.
console.log("\n[models/index.js] Poblando 'db' desde sequelize.models para asegurar carga completa...");
for (const modelName in sequelize.models) {
    db[modelName] = sequelize.models[modelName];
}
console.log("[models/index.js] Modelos cargados en 'db':", Object.keys(db).join(', '));


// --- PASO 3: Definir las asociaciones de manera centralizada ---
// En este punto, es 100% seguro que todos los modelos existen en el objeto 'db'.
console.log("\n[models/index.js] Iniciando definición de asociaciones...");

// Desestructuramos los modelos desde nuestro objeto 'db' ya poblado.
// Asegúrate que los nombres (ej. 'user', 'role') coinciden con los del `sequelize.define('nombre', ...)`
const {
     user, role, permission, privilege, RolePrivilege,
     Provider, Supply, RegisterPurchase, PurchaseDetail,
     Product, SpecSheet, SpecSheetSupply, SpecSheetProcess, Process,
     ProductionOrder, ProductionOrderDetail, ProductionOrderSupply, Employee,
     ExpenseCategory, SpecificConceptSpent, MonthlyOverallExpense, MonthlyExpenseItem
} = db;

const modelosExisten = (...modelos) => modelos.every(modelo => !!modelo);

// --- Asociaciones de Usuarios y Permisos ---
if (modelosExisten(role, user)) {
    role.hasMany(user, { foreignKey: 'idRole', as: 'users' });
    user.belongsTo(role, { foreignKey: 'idRole', as: 'role' });
}
if (modelosExisten(permission, privilege)) {
    permission.hasMany(privilege, { foreignKey: 'idPermission', as: 'privileges' });
    privilege.belongsTo(permission, { foreignKey: 'idPermission', as: 'permission' });
}
// ===== BLOQUE CRÍTICO PARA TU ERROR =====
if (modelosExisten(role, privilege, RolePrivilege)) {
    // Relaciones Many-to-Many
    role.belongsToMany(privilege, { through: RolePrivilege, foreignKey: 'idRole', otherKey: 'idPrivilege', as: 'privileges'});
    privilege.belongsToMany(role, { through: RolePrivilege, foreignKey: 'idPrivilege', otherKey: 'idRole', as: 'roles'});
    
    // Relaciones directas con el modelo intermedio (las que importan para el 'include')
    role.hasMany(RolePrivilege, { foreignKey: 'idRole', as: 'rolePrivilegeEntries' });
    RolePrivilege.belongsTo(role, { foreignKey: 'idRole', as: 'roleDetails' });
    
    privilege.hasMany(RolePrivilege, { foreignKey: 'idPrivilege', as: 'rolePrivilegeEntries' });
    RolePrivilege.belongsTo(privilege, { foreignKey: 'idPrivilege', as: 'privilegeDetails' });
} else {
    console.error("[models/index.js] !!! ADVERTENCIA CRÍTICA: No se pudieron definir las asociaciones de permisos. Uno de los modelos (role, privilege, RolePrivilege) no se cargó correctamente. Revisa sus archivos .js.");
}

// --- Asociaciones de Producción y Fichas Técnicas ---
if (modelosExisten(Product, SpecSheet)) {
    Product.hasMany(SpecSheet, { foreignKey: 'idProduct', as: 'specSheets', onDelete: 'CASCADE' });
    SpecSheet.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });
}
if (modelosExisten(SpecSheet, Supply, SpecSheetSupply)) {
    SpecSheet.belongsToMany(Supply, { through: SpecSheetSupply, foreignKey: 'idSpecSheet', otherKey: 'idSupply', as: 'supplies' });
    Supply.belongsToMany(SpecSheet, { through: SpecSheetSupply, foreignKey: 'idSupply', otherKey: 'idSpecSheet', as: 'specSheetsThroughSupplies' });
    SpecSheet.hasMany(SpecSheetSupply, { foreignKey: 'idSpecSheet', as: 'specSheetSupplies' });
    SpecSheetSupply.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });
    SpecSheetSupply.belongsTo(Supply, { foreignKey: 'idSupply', as: 'supply' });
}
if (modelosExisten(SpecSheet, SpecSheetProcess)) {
    SpecSheet.hasMany(SpecSheetProcess, {foreignKey: 'idSpecSheet', as: 'specSheetProcesses', onDelete: 'CASCADE', hooks: true });
    SpecSheetProcess.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet'});
}
if (modelosExisten(SpecSheetProcess, Process)) {
    SpecSheetProcess.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcessData', allowNull: true });
}
if (modelosExisten(PurchaseDetail, SpecSheetSupply)) {
    SpecSheetSupply.belongsTo(PurchaseDetail, { foreignKey: 'idPurchaseDetail', as: 'purchaseDetail', allowNull: true });
    PurchaseDetail.hasMany(SpecSheetSupply, { foreignKey: 'idPurchaseDetail', as: 'specSheetEntries' });
}
if (modelosExisten(Product, ProductionOrder)) {
    Product.hasMany(ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrdersFromProduct', onDelete: 'RESTRICT' });
    ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });
}
if (modelosExisten(SpecSheet, ProductionOrder)) {
    SpecSheet.hasMany(ProductionOrder, { foreignKey: 'idSpecSheet', as: 'productionOrdersUsingSpec', onDelete: 'RESTRICT' });
    ProductionOrder.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' }); // Corregido el alias a minúscula por convención
}
if (modelosExisten(Employee, ProductionOrder)) {
    Employee.hasMany(ProductionOrder, { foreignKey: 'idEmployeeRegistered', as: 'createdProductionOrders' });
    ProductionOrder.belongsTo(Employee, { foreignKey: 'idEmployeeRegistered', as: 'employeeRegistered' });
}
if (modelosExisten(Provider, ProductionOrder)) {
    Provider.hasMany(ProductionOrder, { foreignKey: 'idProvider', as: 'productionOrdersForProvider' });
    ProductionOrder.belongsTo(Provider, { foreignKey: 'idProvider', as: 'provider', allowNull: true });
}
if (modelosExisten(ProductionOrder, ProductionOrderDetail)) {
    ProductionOrder.hasMany(ProductionOrderDetail, { foreignKey: 'idProductionOrder', as: 'productionOrderDetails', onDelete: 'CASCADE' });
    ProductionOrderDetail.belongsTo(ProductionOrder, { foreignKey: { name: 'idProductionOrder', allowNull: false }, as: 'productionOrder'});
}
if (modelosExisten(Process, ProductionOrderDetail)) {
    Process.hasMany(ProductionOrderDetail, { foreignKey: 'idProcess', as: 'stepsInOrders', onDelete: 'RESTRICT' });
    ProductionOrderDetail.belongsTo(Process, { foreignKey: 'idProcess', as: 'processDetails' });
}
if (modelosExisten(Employee, ProductionOrderDetail)) {
    Employee.hasMany(ProductionOrderDetail, { foreignKey: 'idEmployeeAssigned', as: 'assignedSteps' });
    ProductionOrderDetail.belongsTo(Employee, { foreignKey: 'idEmployeeAssigned', as: 'employeeAssigned', allowNull: true });
}
if (modelosExisten(ProductionOrder, Supply, ProductionOrderSupply)) {
    ProductionOrder.belongsToMany(Supply, { through: ProductionOrderSupply, foreignKey: 'idProductionOrder', otherKey: 'idSupply', as: 'consumedSupplies' });
    Supply.belongsToMany(ProductionOrder, { through: ProductionOrderSupply, foreignKey: 'idSupply', otherKey: 'idProductionOrder', as: 'productionOrdersConsumedIn' });
    ProductionOrder.hasMany(ProductionOrderSupply, { foreignKey: 'idProductionOrder', as: 'productionOrderSupplies' });
    ProductionOrderSupply.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
    ProductionOrderSupply.belongsTo(Supply, { foreignKey: 'idSupply', as: 'supply' });
}

// --- Asociaciones de Compras ---
if (modelosExisten(Supply, PurchaseDetail)) {
    Supply.hasMany(PurchaseDetail, { foreignKey: { name: 'idSupply', allowNull: false }, as: 'purchaseDetailsForSupply' });
    PurchaseDetail.belongsTo(Supply, { foreignKey: { name: 'idSupply', allowNull: false }, as: 'supply' }); 
}
if (modelosExisten(Provider, RegisterPurchase)) {
    Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
    RegisterPurchase.belongsTo(Provider, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'provider' });
}
if (modelosExisten(RegisterPurchase, PurchaseDetail)) {
    RegisterPurchase.hasMany(PurchaseDetail, { foreignKey: { name: 'idRegisterPurchase', allowNull: false }, as: 'details' });
    PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: { name: 'idRegisterPurchase', allowNull: false }, as: 'registerPurchase' });
}

// --- Asociaciones de Gastos ---
if (modelosExisten(SpecificConceptSpent, ExpenseCategory)) {
    ExpenseCategory.hasMany(SpecificConceptSpent, { foreignKey: 'idExpenseCategory', as: 'specificConcepts' });
    SpecificConceptSpent.belongsTo(ExpenseCategory, { foreignKey: 'idExpenseCategory', as: 'expenseCategory' });
}
if (modelosExisten(MonthlyExpenseItem, MonthlyOverallExpense)) {
    MonthlyOverallExpense.hasMany(MonthlyExpenseItem, { foreignKey: 'idOverallMonth', as: 'expenseItems', onDelete: 'CASCADE' });
    MonthlyExpenseItem.belongsTo(MonthlyOverallExpense, { foreignKey: 'idOverallMonth', as: 'monthlyOverallExpense' });
}
if (modelosExisten(MonthlyExpenseItem, SpecificConceptSpent)) {
    SpecificConceptSpent.hasMany(MonthlyExpenseItem, { foreignKey: 'idSpecificConcept', as: 'monthlyItems' });
    MonthlyExpenseItem.belongsTo(SpecificConceptSpent, { foreignKey: 'idSpecificConcept', as: 'specificConceptSpent' });
}

console.log("[models/index.js] Todas las asociaciones han sido definidas.");

// --- PASO 4: Exportar ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("\n[models/index.js] Configuración del módulo de modelos completada y exportada.\n");
module.exports = db;