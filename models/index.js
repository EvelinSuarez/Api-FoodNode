// models/index.js
'use strict';

const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const db = {};

// --- 1. Carga Dinámica de Modelos ---
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
    try { // Añadir try-catch para mejor diagnóstico de carga de modelo
        const model = require(path.join(__dirname, file));
        if (model && model.name) {
            db[model.name] = model;
            console.log(`MODELOS/INDEX.JS: Modelo ${model.name} cargado desde ${file}. (typeof: ${typeof model})`);
        } else {
            console.warn(`MODELOS/INDEX.JS: El archivo ${file} no parece exportar un modelo de Sequelize válido (falta model.name o model es undefined). Model:`, model);
        }
    } catch (e) {
        console.error(`MODELOS/INDEX.JS: Error cargando modelo desde ${file}:`, e);
    }
  });

if (Object.keys(db).length === 0) {
    console.error("MODELOS/INDEX.JS: No se cargaron modelos. Verifica la estructura de tus archivos de modelo y su exportación.");
} else {
    console.log("MODELOS/INDEX.JS: Todos los modelos disponibles cargados en 'db'. Modelos cargados:", Object.keys(db).join(', '));
}

// --- 2. Definición de Asociaciones (Centralizada) ---
// Desestructurar directamente de db para asegurar que usamos lo que se cargó
const {
     user: User,
    role: Role,
    permission: Permission,
    privilege: Privilege,
    // Modelos que ya están en CamelCase en db (según tus logs)
    RolePrivilege,
    Provider, Supply, RegisterPurchase, PurchaseDetail, // Supply debería estar aquí ahora
    Product, SpecSheet, SpecSheetSupply, SpecSheetProcess, Process,
    ProductionOrder, ProductionOrderDetail, ProductionOrderSupply, Employee,
    ExpenseCategory, SpecificConceptSpent, MonthlyOverallExpense, MonthlyExpenseItem
} = db; // Tomar de db

const modelosExisten = (...modelos) => modelos.every(modelo => {
    if (!modelo) console.warn("MODELOS/INDEX.JS: Un modelo es undefined durante la comprobación de existencia para asociaciones.");
    return !!modelo;
});

// ... (otras asociaciones sin cambios) ...
if (modelosExisten(Role, User)) {
    Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
    // console.log("MODELOS/INDEX.JS: Asociaciones User<=>Role definidas."); // Comentado para reducir logs
}

if (modelosExisten(Permission, Privilege)) {
    Permission.hasMany(Privilege, { foreignKey: 'idPermission', as: 'privileges' });
    Privilege.belongsTo(Permission, { foreignKey: 'idPermission', as: 'permission' });
    // console.log("MODELOS/INDEX.JS: Asociaciones Permission<=>Privilege definidas.");
}

if (modelosExisten(Role, Privilege, RolePrivilege)) {
    Role.belongsToMany(Privilege, { through: RolePrivilege, foreignKey: 'idRole', otherKey: 'idPrivilege', as: 'privileges'});
    Privilege.belongsToMany(Role, { through: RolePrivilege, foreignKey: 'idPrivilege', otherKey: 'idRole', as: 'roles'});
    Role.hasMany(RolePrivilege, { foreignKey: 'idRole', as: 'rolePrivilegeEntries' });
    RolePrivilege.belongsTo(Role, { foreignKey: 'idRole', as: 'roleDetails' });
    Privilege.hasMany(RolePrivilege, { foreignKey: 'idPrivilege', as: 'rolePrivilegeEntries' });
    RolePrivilege.belongsTo(Privilege, { foreignKey: 'idPrivilege', as: 'privilegeDetails' });
    // console.log("MODELOS/INDEX.JS: Asociaciones Role<=>Privilege (many-to-many) y con RolePrivilege definidas.");
}

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
    // console.log("MODELOS/INDEX.JS: Asociaciones SpecSheet<=>SpecSheetProcess definidas.");
}


if (modelosExisten(SpecSheetProcess, Process)) {
    SpecSheetProcess.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcessData', allowNull: true });
    // console.log("MODELOS/INDEX.JS: Asociaciones SpecSheetProcess<=>Process definidas.");
}

if (modelosExisten(Product, ProductionOrder)) {
    Product.hasMany(ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrdersFromProduct', onDelete: 'RESTRICT' });
    ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });
}
if (modelosExisten(SpecSheet, ProductionOrder)) {
    SpecSheet.hasMany(ProductionOrder, { foreignKey: 'idSpecSheet', as: 'productionOrdersUsingSpec', onDelete: 'RESTRICT' });
    ProductionOrder.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });
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
    ProductionOrderDetail.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
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
if (modelosExisten(Provider, RegisterPurchase)) {
    Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
    RegisterPurchase.belongsTo(Provider, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'provider' });
    console.log("MODELOS/INDEX.JS: Asociaciones Provider<=>RegisterPurchase definidas.");
}
if (modelosExisten(RegisterPurchase, PurchaseDetail)) {
    RegisterPurchase.hasMany(PurchaseDetail, { foreignKey: { name: 'idRegisterPurchase', allowNull: false }, as: 'details' }); // CAMBIO: alias 'details' para consistencia con el servicio de recálculo
    PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: { name: 'idRegisterPurchase', allowNull: false }, as: 'registerPurchase' });
    console.log("MODELOS/INDEX.JS: Asociaciones RegisterPurchase<=>PurchaseDetail definidas.");
}
if (modelosExisten(Supply, PurchaseDetail)) { // Asegúrate que Supply sea el modelo correcto de db.Supply
    if (typeof Supply.hasMany !== 'function' || typeof PurchaseDetail.belongsTo !== 'function') {
        console.error("MODELOS/INDEX.JS: ERROR - Supply o PurchaseDetail no son modelos válidos para la asociación de Compras.");
    } else {
        Supply.hasMany(PurchaseDetail, { foreignKey: { name: 'idSupply', allowNull: false }, as: 'purchaseDetailsForSupply' });
        // Usar 'supply' como alias para cuando se incluye desde PurchaseDetail
        PurchaseDetail.belongsTo(Supply, { foreignKey: { name: 'idSupply', allowNull: false }, as: 'supply' }); 
        console.log("MODELOS/INDEX.JS: Asociaciones Supply<=>PurchaseDetail definidas.");
    }
} else {
     console.warn("MODELOS/INDEX.JS: Los modelos Supply o PurchaseDetail no existen, no se definirán sus asociaciones.");
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

// --- 3. Bucle 'associate' (Si algún modelo individual define asociaciones) ---
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    // console.log(`MODELOS/INDEX.JS: Aplicando 'associate' para el modelo ${modelName}`);
    db[modelName].associate(db);
  }
});

// --- 4. Exportar ---
db.sequelize = sequelize; // Usar la instancia importada
db.Sequelize = Sequelize; // Exportar la clase Sequelize

console.log("MODELOS/INDEX.JS: Configuración de modelos, asociaciones y hooks completada. Exportando db.");
module.exports = db;