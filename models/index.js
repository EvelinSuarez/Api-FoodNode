// models/index.js
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const db = {};

// --- 1. Carga de Todos los Modelos ---
try {
    db.Role = require('./role');
    db.User = require('./user');
    db.Permission = require('./permission');
    db.Privilege = require('./privilege');
    db.RolePrivilege = require('./rolePrivileges');
    db.Provider = require('./provider');
    db.Supplier = require('./supplier');
    db.RegisterPurchase = require('./registerPurchase');
    db.PurchaseDetail = require('./purchaseDetail');
    db.Product = require('./Product');
    db.SpecSheet = require('./specSheet');
    db.ProductSheet = require('./productSheet');
    db.ProductionOrder = require('./productionOrder');
    db.Employee = require('./employee');
    db.Process = require('./process');
    db.ProcessDetail = require('./processDetail');

    // === MODELOS PARA GASTOS ===
    db.ExpenseCategory = require('./ExpenseCategory');
    db.SpecificConceptSpent = require('./SpecificConceptSpent'); // Este modelo tiene idExpenseCategory
    db.MonthlyOverallExpense = require('./monthlyOverallExpense'); // Este modelo YA NO tiene idExpenseCategory
    db.MonthlyExpenseItem = require('./monthlyExpenseItem');

    console.log("MODELOS/INDEX.JS: Todos los modelos cargados correctamente.");

} catch (error) {
    console.error("MODELOS/INDEX.JS: Error al cargar uno o más modelos:", error);
    throw error;
}

// --- 2. Definición Explícita de Asociaciones (Centralizada) ---
const {
    Role, User, Permission, Privilege, RolePrivilege,
    Provider, Supplier, RegisterPurchase, PurchaseDetail,
    Product, SpecSheet, ProductSheet, ProductionOrder, Employee, Process, ProcessDetail,
    ExpenseCategory, SpecificConceptSpent, MonthlyOverallExpense, MonthlyExpenseItem
} = db;

const modelosExisten = (...modelos) => modelos.every(modelo => !!modelo);

// --- Tus asociaciones existentes (sin cambios) ---
if (modelosExisten(Role, User)) {
    Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
}
if (modelosExisten(Permission, Privilege)) {
    Permission.hasMany(Privilege, { foreignKey: 'idPermission', as: 'privileges' });
    Privilege.belongsTo(Permission, { foreignKey: 'idPermission', as: 'permission' });
}
if (modelosExisten(Role, Privilege, RolePrivilege)) {
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
    RolePrivilege.belongsTo(Role, { foreignKey: 'idRole', as: 'roleDetailsInPrivilegeLink' });
    RolePrivilege.belongsTo(Privilege, { foreignKey: 'idPrivilege', as: 'privilegeDetailsInRoleLink' });
    Role.hasMany(RolePrivilege, { foreignKey: 'idRole', as: 'rolePrivilegeLinkEntries'});
    Privilege.hasMany(RolePrivilege, { foreignKey: 'idPrivilege', as: 'privilegeInRolesLinkEntries'});
}
if (modelosExisten(Product, SpecSheet)) {
    Product.hasMany(SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
    SpecSheet.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });
}
if (modelosExisten(SpecSheet, ProductSheet)) {
    SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet', as: 'ingredients' });
    ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });
}
if (modelosExisten(Supplier, ProductSheet)) {
    Supplier.hasMany(ProductSheet, { foreignKey: 'idSupplier', as: 'supplierIngredients' });
    ProductSheet.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'supplier' });
}
if (modelosExisten(ProductionOrder, Product)) {
    ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'productOrdered' });
    Product.hasMany(ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrders' });
}
if (modelosExisten(ProductionOrder, SpecSheet)) {
    ProductionOrder.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' });
}
if (modelosExisten(ProductionOrder, ProcessDetail)) {
    ProductionOrder.hasMany(ProcessDetail, { foreignKey: 'idProductionOrder', as: 'steps' });
}
if (modelosExisten(ProcessDetail, ProductionOrder)) {
    ProcessDetail.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
}
if (modelosExisten(ProcessDetail, Process)) {
    ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcess' });
}
if (modelosExisten(ProcessDetail, SpecSheet)) {
    ProcessDetail.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'relatedSpecSheet' });
}
if (modelosExisten(ProcessDetail, Employee)) {
    ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });
}
if (modelosExisten(Employee, ProcessDetail)) {
    Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' });
}
if (modelosExisten(Provider, RegisterPurchase)) {
    Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
    RegisterPurchase.belongsTo(Provider, { foreignKey: 'idProvider', as: 'provider' });
}
if (modelosExisten(RegisterPurchase, PurchaseDetail)) {
    RegisterPurchase.hasMany(PurchaseDetail, {
        foreignKey: { name: 'idRegisterPurchase', allowNull: false },
        as: 'details',
        onDelete: 'CASCADE'
    });
    PurchaseDetail.belongsTo(RegisterPurchase, { foreignKey: 'idRegisterPurchase', as: 'purchase' });
}
if (modelosExisten(Supplier, PurchaseDetail)) {
    Supplier.hasMany(PurchaseDetail, { foreignKey: { name: 'idSupplier', allowNull: false }, as: 'purchaseOccurrences' });
    PurchaseDetail.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'insumoSupplier' });
}
// --- Fin de tus asociaciones existentes ---

// === ASOCIACIONES PARA EL MÓDULO DE GASTOS ===

// Un SpecificConceptSpent pertenece a UNA ExpenseCategory.
// Una ExpenseCategory tiene MUCHOS SpecificConceptSpent.
if (modelosExisten(SpecificConceptSpent, ExpenseCategory)) {
    console.log("MODELOS/INDEX.JS: Definiendo asociación SpecificConceptSpent <-> ExpenseCategory (1-M)");

    SpecificConceptSpent.belongsTo(ExpenseCategory, {
        foreignKey: 'idExpenseCategory',
        as: 'expenseCategoryDetails', // Alias para acceder a la categoría desde un concepto
        // allowNull: false, // Ya está en el modelo SpecificConceptSpent
    });

    ExpenseCategory.hasMany(SpecificConceptSpent, {
        foreignKey: 'idExpenseCategory',
        as: 'specificConcepts' // Alias para acceder a los conceptos desde una categoría
    });
} else {
    console.error("MODELOS/INDEX.JS: Faltan modelos SpecificConceptSpent o ExpenseCategory para la asociación 1-M.");
    // ... (logs de error más detallados si es necesario) ...
}

// ELIMINADA LA ASOCIACIÓN DIRECTA: MonthlyOverallExpense <-> ExpenseCategory
// PORQUE MonthlyOverallExpense YA NO TIENE idExpenseCategory.
// La "categoría" de un MonthlyOverallExpense se infiere de sus MonthlyExpenseItems.


// Un MonthlyExpenseItem pertenece a UN MonthlyOverallExpense.
// Un MonthlyOverallExpense tiene MUCHOS MonthlyExpenseItem.
if (modelosExisten(MonthlyExpenseItem, MonthlyOverallExpense)) {
    console.log("MODELOS/INDEX.JS: Definiendo asociación MonthlyExpenseItem <-> MonthlyOverallExpense (1-M)");
    MonthlyOverallExpense.hasMany(MonthlyExpenseItem, {
        foreignKey: 'idOverallMonth',
        as: 'expenseItems', // Este alias es usado por el frontend para incluir los ítems
        onDelete: 'CASCADE'
    });
    MonthlyExpenseItem.belongsTo(MonthlyOverallExpense, {
        foreignKey: 'idOverallMonth',
        as: 'overallMonthRecord',
        // allowNull: false, // Ya está en el modelo MonthlyExpenseItem
    });
} else {
    console.error("MODELOS/INDEX.JS: Faltan modelos MonthlyExpenseItem o MonthlyOverallExpense para la asociación.");
    // ... (logs de error más detallados si es necesario) ...
}

// Un MonthlyExpenseItem usa UN SpecificConceptSpent.
// Un SpecificConceptSpent puede estar en MUCHOS MonthlyExpenseItem.
if (modelosExisten(MonthlyExpenseItem, SpecificConceptSpent)) {
    console.log("MODELOS/INDEX.JS: Definiendo asociación MonthlyExpenseItem <-> SpecificConceptSpent (1-M)");
    MonthlyExpenseItem.belongsTo(SpecificConceptSpent, {
        foreignKey: 'idSpecificConcept',
        as: 'specificConceptDetails', // Alias para acceder al concepto desde un ítem
        // allowNull: false, // Ya está en el modelo MonthlyExpenseItem
    });
    SpecificConceptSpent.hasMany(MonthlyExpenseItem, {
        foreignKey: 'idSpecificConcept',
        as: 'monthlyItems' // Alias para acceder a los ítems desde un concepto
    });
} else {
    console.error("MODELOS/INDEX.JS: Faltan modelos MonthlyExpenseItem o SpecificConceptSpent para la asociación.");
    // ... (logs de error más detallados si es necesario) ...
}
// === FIN ASOCIACIONES DE GASTOS ===

// --- 3. Bucle 'associate' (Si algún modelo individual define asociaciones) ---
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    // console.log(`MODELOS/INDEX.JS: Aplicando 'associate' para el modelo ${modelName}`);
    db[modelName].associate(db);
  }
});

// --- 4. Exportar ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("MODELOS/INDEX.JS: Configuración de modelos y asociaciones completada.");
module.exports = db;