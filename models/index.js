// 'use strict';

// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const db = {};

// // Carga de modelos
// db.Provider = require('./provider');
// db.Supplier = require('./supplier');
// db.RegisterPurchase = require('./registerPurchase');
// db.PurchaseDetail = require('./purchaseDetail');
// db.Role = require('./role');
// db.User = require('./user');
// db.Permission = require('./permission');
// db.Privilege = require('./privilege');
// db.RolePrivilege = require('./rolePrivileges');
// db.Provider = require('./provider');
// db.Product = require('./Product');
// db.SpecSheet = require('./specSheet');
// db.ProductSheet = require('./productSheet');
// db.Supplier = require('./supplier');
// db.ProductionOrder = require('./productionOrder');
// db.Employee = require('./employee');
// db.Process = require('./process');
// db.ProcessDetail = require('./processDetail');
   

// // Extraer modelos para uso en asociaciones
// const {
//     Provider, Supplier, RegisterPurchase, PurchaseDetail,
//     Role, User, Permission, Privilege, RolePrivilege, Product, SpecSheet, ProductSheet, ProductionOrder, Employee, Process, ProcessDetail
// } = db;

// // Product <-> SpecSheet (Relación Uno-a-Muchos directa)
// Product.hasMany(SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
// SpecSheet.belongsTo(Product, { foreignKey: 'idProduct', as: 'product' });

// // SpecSheet <-> ProductSheet (Ingredientes de la Ficha)
// SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet', as: 'ProductSheets' }); // o 'productSheetItems'
// ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });

// // Supplier <-> ProductSheet (Proveedor del Ingrediente)
// Supplier.hasMany(ProductSheet, { foreignKey: 'idSupplier', as: 'supplierIngredients' });
// ProductSheet.belongsTo(Supplier, { foreignKey: 'idSupplier', as: 'supplier' });

// // ProductionOrder relaciones
// ProductionOrder.belongsTo(Product, { foreignKey: 'idProduct', as: 'productOrdered' }); // 'product' ya usado

// ProductionOrder.hasMany(db.ProcessDetail ,{ foreignKey: 'idProductionOrder', as: 'steps' });

// // ProcessDetail relaciones
// db.ProcessDetail.belongsTo(ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
// db.ProcessDetail.belongsTo(Process, { foreignKey: 'idProcess', as: 'masterProcess' });
// db.ProcessDetail.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'relatedSpecSheet' }); // 'specSheet' ya usado
// db.ProcessDetail.belongsTo(Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });


// // Employee relaciones
// Employee.hasMany(ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' }); // 'assignedProcessDetails' ya usado

// // Tus asociaciones existentes (asegúrate que usen los modelos de 'db' o los desestructurados)
// Provider.hasMany(RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });


// RegisterPurchase.belongsTo(Provider, {
//     foreignKey: 'idProvider',
//     as: 'provider'
// });

// RegisterPurchase.hasMany(PurchaseDetail, {
//     foreignKey: { name: 'idRegisterPurchase', allowNull: false },
//     as: 'details',
//     onDelete: 'CASCADE'
// });
// PurchaseDetail.belongsTo(RegisterPurchase, {
//     foreignKey: 'idRegisterPurchase',
//     as: 'purchase'
// });

// Supplier.hasMany(PurchaseDetail, {
//     foreignKey: { name: 'idSupplier', allowNull: false },
//     as: 'purchaseOccurrences'
// });
// PurchaseDetail.belongsTo(Supplier, {
//     foreignKey: 'idSupplier',
//     as: 'insumo'
// });

// // --- Asociaciones: Roles y Usuarios ---
// Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
// User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });


// // Un Rol tiene muchas entradas en RolePrivileges
// // ESTA ES LA ASOCIACIÓN CLAVE PARA LA CREACIÓN ANIDADA EN RoleService.createRole
// db.Role.hasMany(db.RolePrivilege, {
//     foreignKey: 'idRole',
//     as: 'privilegeAssignments' // Alias usado en RoleService.createRole
// });
// // La asociación db.RolePrivilege.belongsTo(db.Role, ...) ya debería estar en tu modelo RolePrivileges.js

// // Un Privilegio puede estar en muchas entradas de RolePrivileges
// // db.Privilege.belongsToMany(db.RolePrivilege, { through: 'rolePrivileges' } );
// // La asociación db.RolePrivilege.belongsTo(db.Privilege, ...) ya debería estar en RolePrivileges.js

// // Un Permiso puede estar en muchas entradas de RolePrivileges
// // db.Permission.belongsToMany(db.RolePrivilege, { through: 'rolePrivileges' } );
// // La asociación db.RolePrivilege.belongsTo(db.Permission, ...) ya debería estar en RolePrivileges.js


// // OPCIONALMENTE: Si quieres usar métodos como role.addPrivilege(privilege, { through: { idPermission: X } })
// // directamente, puedes definir belongsToMany. Si no, las hasMany anteriores y bulkCreate son suficientes.
// /*
// db.Role.belongsToMany(db.Privilege, {
//     through: db.RolePrivilege,
//     foreignKey: 'idRole',
//     otherKey: 'idPrivilege',
//     as: 'privileges' // Alias para acceder a los privilegios directos de un rol
// });
// db.Privilege.belongsToMany(db.Role, {
//     through: db.RolePrivilege,
//     foreignKey: 'idPrivilege',
//     otherKey: 'idRole',
//     as: 'rolesHavingThisPrivilege' // Alias único
// });

// db.Role.belongsToMany(db.Permission, {
//     through: db.RolePrivilege,
//     foreignKey: 'idRole',
//     otherKey: 'idPermission',
//     as: 'permissions' // Alias para acceder a los permisos directos de un rol
// });
// db.Permission.belongsToMany(db.Role, {
//     through: db.RolePrivilege,
//     foreignKey: 'idPermission',
//     otherKey: 'idRole',
//     as: 'rolesHavingThisPermission' // Alias único
// });
// */



// if (db.ProductionOrder && db.Product) {
//     console.log("Definiendo ProductionOrder.belongsTo(Product)");
//     db.ProductionOrder.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'product' });
// } else {
//     console.error("Error al definir ProductionOrder -> Product: Modelos no listos.");
//     if(!db.ProductionOrder) console.error("db.ProductionOrder es undefined");
//     if(!db.Product) console.error("db.Product es undefined");
// }

// if (db.ProductionOrder && db.SpecSheet) {
//     console.log("Definiendo ProductionOrder.belongsTo(SpecSheet)");
//     db.ProductionOrder.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' });
// } else {
//     console.error("Error al definir ProductionOrder -> SpecSheet: Modelos no listos.");
//     if(!db.ProductionOrder) console.error("db.ProductionOrder es undefined");
//     if(!db.SpecSheet) console.error("db.SpecSheet es undefined");
// }

// console.log("\n--- ANTES de ProductionOrder.hasMany(ProcessDetail) ---");

// console.log("Verificando db.ProductionOrder:");
// if (db.ProductionOrder) {
//     console.log("  Tipo:", typeof db.ProductionOrder);
//     console.log("  Nombre del Modelo:", db.ProductionOrder.name);
//     console.log("  Es instancia de Sequelize.Model:", db.ProductionOrder instanceof Sequelize.Model);
//     console.log("  Tiene método hasMany:", typeof db.ProductionOrder.hasMany === 'function');
// } else {
//     console.log("  db.ProductionOrder es UNDEFINED");
// }

// console.log("Verificando db.ProcessDetail:"); // <--- ¡USA db.ProcessDetail AQUÍ!
// if (db.ProcessDetail) {
//     console.log("  Tipo:", typeof db.ProcessDetail);
//     console.log("  Nombre del Modelo:", db.ProcessDetail.name);
//     console.log("  Es instancia de Sequelize.Model:", db.ProcessDetail instanceof Sequelize.Model);
// } else {
//     console.log("  db.ProcessDetail es UNDEFINED");
// }
// console.log("----------------------------------------------------");

// // Línea 113 o la del error:
// if (db.ProductionOrder && db.ProductionOrder.hasMany && db.ProcessDetail instanceof Sequelize.Model) {
//     db.ProductionOrder.hasMany(db.ProcessDetail, { foreignKey: 'idProductionOrder', as: 'steps' });
//     console.log("Asociación ProductionOrder.hasMany(ProcessDetail) definida con ÉXITO.");
// } else {
//     console.error("FALLO al definir ProductionOrder.hasMany(ProcessDetail).");
//     // ... (más logs detallados de por qué falló, como te mostré antes)
// }
// // No olvides las asociaciones inversas también para Product, SpecSheet, ProcessDetail si las necesitas
// // Por ejemplo, en la sección de Product:
// if (db.Product && db.ProductionOrder) {
//     console.log("Definiendo Product.hasMany(ProductionOrder)");
//     db.Product.hasMany(db.ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrders' });
// };


// // Agrega instancias a db
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

// models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
// const process = require('process'); // No parece que lo uses
const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development'; // Lo definirás abajo si es necesario
// const config = require(__dirname + '/../config/config.json')[env]; // Usarás ../config/database.js
const sequelize = require('../config/database'); // <--- Ya tienes esto para la instancia de sequelize
const db = {};

// Carga de modelos
// db.Provider = require('./provider')(sequelize, Sequelize.DataTypes); // Ejemplo de cómo se haría si pasas sequelize
// ... (tus cargas actuales están bien si los modelos individuales ya usan la instancia de sequelize de ../config/database)
db.Role = require('./role');
db.User = require('./user');
db.Permission = require('./permission');
db.Privilege = require('./privilege');
db.RolePrivilege = require('./rolePrivileges'); // Asegúrate que el nombre del modelo sea consistente (RolePrivilege vs rolePrivileges)
// ... Carga todos tus otros modelos
db.Provider = require('./provider');
db.Supplier = require('./supplier');
db.RegisterPurchase = require('./registerPurchase');
db.PurchaseDetail = require('./purchaseDetail');
db.Product = require('./Product'); // Cuidado con mayúsculas/minúsculas, usualmente es PascalCase para nombres de modelo
db.SpecSheet = require('./specSheet');
db.ProductSheet = require('./productSheet');
db.ProductionOrder = require('./productionOrder');
db.Employee = require('./employee');
db.Process = require('./process');
db.ProcessDetail = require('./processDetail');


// Aplicar asociaciones si los modelos las tienen definidas como método 'associate'
// (Esto es útil si defines asociaciones dentro de cada archivo de modelo)
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) { // Añadida verificación de existencia del modelo
    db[modelName].associate(db);
  }
});

// --- Definición explícita de asociaciones (RECOMENDADO centralizar aquí) ---
// Extraer modelos para claridad (opcional, pero ayuda)
const {
    Role, User, Permission, Privilege, RolePrivilege, /* ...otros modelos... */
} = db;


// --- Asociaciones Clave para Roles, Permisos, Privilegios ---
if (Role && User) {
    Role.hasMany(User, { foreignKey: 'idRole', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'idRole', as: 'role' });
}
// SpecSheet <-> ProductSheet (Ingredientes de la Ficha)
SpecSheet.hasMany(ProductSheet, { foreignKey: 'idSpecSheet', as: 'ingredients' }); // o 'productSheetItems'
ProductSheet.belongsTo(SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });

// ***** LA ASOCIACIÓN CRÍTICA FALTANTE *****
if (Permission && Privilege) {
    // Un Permiso TIENE MUCHOS Privilegios
    Permission.hasMany(Privilege, {
        foreignKey: 'idPermission', // En la tabla 'privileges'
        as: 'privileges'         // Para acceder a los privilegios desde un permiso (permission.getPrivileges())
    });
    // Un Privilegio PERTENECE A UN Permiso
    Privilege.belongsTo(Permission, {
        foreignKey: 'idPermission', // En la tabla 'privileges'
        as: 'permission'         // ¡¡ESTE ES EL ALIAS QUE NECESITAS EN TU REPOSITORIO!! (privilege.getPermission())
    });
} else {
    console.error("MODELOS/INDEX.JS: Error - Modelos Permission o Privilege no están definidos correctamente en 'db'.");
}

if (Role && RolePrivilege && Privilege) {
    // Asociaciones para la tabla de unión RolePrivilege
    // Un Rol tiene muchas entradas en RolePrivilege
    Role.hasMany(RolePrivilege, {
        foreignKey: 'idRole',
        as: 'privilegeAssignments' // Usado para crear/actualizar RolePrivileges anidadamente desde Role
    });
    RolePrivilege.belongsTo(Role, {
        foreignKey: 'idRole',
        as: 'role' // Para acceder al Rol desde una entrada de RolePrivilege
    });

    // Un Privilegio está en muchas entradas de RolePrivilege
    Privilege.hasMany(RolePrivilege, {
        foreignKey: 'idPrivilege',
        as: 'roleAssignments' // Para ver en qué asignaciones de rol-privilegio está un privilegio
    });
    RolePrivilege.belongsTo(Privilege, {
        foreignKey: 'idPrivilege',
        as: 'privilege' // Para acceder al Privilegio desde una entrada de RolePrivilege
    });

    // Opcional pero recomendado: Relaciones Many-to-Many directas
    Role.belongsToMany(Privilege, {
        through: RolePrivilege, // Especifica la tabla de unión
        foreignKey: 'idRole',
        otherKey: 'idPrivilege',
        as: 'assignedPrivileges' // Ej: role.getAssignedPrivileges()
    });
    Privilege.belongsToMany(Role, {
        through: RolePrivilege,
        foreignKey: 'idPrivilege',
        otherKey: 'idRole',
        as: 'assignedToRoles' // Ej: privilege.getAssignedToRoles()
    });
} else {
     console.error("MODELOS/INDEX.JS: Error - Modelos Role, RolePrivilege o Privilege no están definidos correctamente en 'db'.");
}

// --- Tus otras asociaciones (asegúrate de que usan los modelos del objeto `db`) ---
// Product <-> SpecSheet
if (db.Product && db.SpecSheet) {
    db.Product.hasMany(db.SpecSheet, { foreignKey: 'idProduct', as: 'specSheets' });
    db.SpecSheet.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'product' });
}
// ... (continúa con el resto de tus asociaciones, usando db.ModelName)

if (db.SpecSheet && db.ProductSheet) {
    db.SpecSheet.hasMany(db.ProductSheet, { foreignKey: 'idSpecSheet', as: 'ProductSheets' });
    db.ProductSheet.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheet' });
}

if (db.Supplier && db.ProductSheet) {
    db.Supplier.hasMany(db.ProductSheet, { foreignKey: 'idSupplier', as: 'supplierIngredients' });
    db.ProductSheet.belongsTo(db.Supplier, { foreignKey: 'idSupplier', as: 'supplier' });
}

if (db.ProductionOrder && db.Product) {
    db.ProductionOrder.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'productOrdered' });
}

if (db.ProductionOrder && db.ProcessDetail) {
    db.ProductionOrder.hasMany(db.ProcessDetail ,{ foreignKey: 'idProductionOrder', as: 'steps' });
}

if (db.ProcessDetail && db.ProductionOrder) {
    db.ProcessDetail.belongsTo(db.ProductionOrder, { foreignKey: 'idProductionOrder', as: 'productionOrder' });
}
if (db.ProcessDetail && db.Process) {
    db.ProcessDetail.belongsTo(db.Process, { foreignKey: 'idProcess', as: 'masterProcess' });
}
if (db.ProcessDetail && db.SpecSheet) {
    db.ProcessDetail.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'relatedSpecSheet' });
}
if (db.ProcessDetail && db.Employee) {
    db.ProcessDetail.belongsTo(db.Employee, { foreignKey: 'idEmployee', as: 'assignedEmployee' });
}

if (db.Employee && db.ProcessDetail) {
    db.Employee.hasMany(db.ProcessDetail, { foreignKey: 'idEmployee', as: 'assignedTasks' });
}

if (db.Provider && db.RegisterPurchase) {
    db.Provider.hasMany(db.RegisterPurchase, { foreignKey: { name: 'idProvider', allowNull: false }, as: 'purchases' });
    db.RegisterPurchase.belongsTo(db.Provider, { foreignKey: 'idProvider', as: 'provider'});
}

if (db.RegisterPurchase && db.PurchaseDetail) {
    db.RegisterPurchase.hasMany(db.PurchaseDetail, {
        foreignKey: { name: 'idRegisterPurchase', allowNull: false },
        as: 'details',
        onDelete: 'CASCADE'
    });
    db.PurchaseDetail.belongsTo(db.RegisterPurchase, { foreignKey: 'idRegisterPurchase', as: 'purchase'});
}

if (db.Supplier && db.PurchaseDetail) {
    db.Supplier.hasMany(db.PurchaseDetail, { foreignKey: { name: 'idSupplier', allowNull: false }, as: 'purchaseOccurrences'});
    db.PurchaseDetail.belongsTo(db.Supplier, { foreignKey: 'idSupplier', as: 'insumo'});
}

// Las asociaciones para ProductionOrder que tenías con logs (asegúrate de que los modelos están en db)
if (db.ProductionOrder && db.Product) { // Product ya se asoció como productOrdered, usa otro alias si es diferente relación
    // db.ProductionOrder.belongsTo(db.Product, { foreignKey: 'idProduct', as: 'product' }); // Esta podría ser la misma que productOrdered
}
if (db.ProductionOrder && db.SpecSheet) {
    db.ProductionOrder.belongsTo(db.SpecSheet, { foreignKey: 'idSpecSheet', as: 'specSheetUsed' });
}
if (db.Product && db.ProductionOrder) {
    db.Product.hasMany(db.ProductionOrder, { foreignKey: 'idProduct', as: 'productionOrders' });
}


// Agrega la instancia de sequelize y Sequelize al objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
