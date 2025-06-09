const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// CÓDIGO MEJORADO (MANTIENE LA LISTA Y AÑADE LOCALHOST)
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite orígenes en la whitelist O cualquier origen de localhost para desarrollo
    if (!origin || whitelist.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

// --- GRUPO: Autenticación y Usuarios ---
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const privilegeRoutes = require("./routes/privilegeRoutes");
const rolePrivilegesRoutes = require("./routes/rolePrivilegesRoutes");

// --- GRUPO: Gestión Interna / Empleados ---
const employeeRoutes = require("./routes/employeeRoutes");

// --- GRUPO: CRM / Clientes y Reservas ---
const customersRoutes = require("./routes/customersRoutes");
const aditionalServicesRoutes = require("./routes/aditionalServicesRoutes"); // Renombrado a singular? 'additionalServiceRoutes'
const reservationsRoutes = require("./routes/reservationsRoutes");
const reservationServicesRoutes = require("./routes/reservationServicesRoutes");

// --- GRUPO: Compras y Proveedores/Insumos ---
const providerRoutes = require("./routes/providerRoutes"); // ¿Es este para "Proveedores de la empresa" o "Insumos"?
const supplyRoutes = require("./routes/supplyRoutes");
const registerPurchaseRoutes = require("./routes/registerPurchaseRoutes");
const purchaseDetailRoutes = require("./routes/purchaseDetailRoutes"); // Probablemente anidado o usado por registerPurchaseRoutes

// --- GRUPO: Producción y Fichas Técnicas ---
const productRoutes = require("./routes/productRoutes");
const specSheetRoutes = require("./routes/specSheetRoutes");
const specSheetProcessRoutes = require('./routes/specSheetProcessRoutes');
// const productSheetRoutes = require("./routes/productSheetRoutes"); // REEMPLAZADO POR specSheetSupplyRoutes
const specSheetSupplyRoutes = require('./routes/specSheetSupplyRoutes'); // NUEVO para SpecSheetSupply
const processRoutes = require("./routes/processRoutes"); // Procesos Maestros
// const processDetailRoutes = require("./routes/processDetailRoutes"); // ¿Relacionado con Process o ProductionOrder?
const productionOrderRoutes = require("./routes/productionOrderRoutes");
const productionOrderDetailRoutes = require("./routes/productionOrderDetailRoutes");
const productionOrderSupplyRoutes = require("./routes/productionOrderSupplyRoutes");


// --- GRUPO: Gastos ---
const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes");
const specificConceptSpentRoutes = require("./routes/specificConceptSpentRoutes");
const monthlyOverallExpenseRoutes = require("./routes/monthlyOverallExpenseRoutes");


// --- Montaje de Rutas ---
// Es buena práctica agruparlas por un prefijo común como /api/v1, pero seguiré tu estructura actual.

console.log("BACKEND: Montando rutas...");

// Autenticación y Usuarios
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/role", roleRoutes);
app.use("/permission", permissionRoutes);
app.use("/privilege", privilegeRoutes);
app.use("/rolePrivileges", rolePrivilegesRoutes);

// Gestión Interna / Empleados
app.use("/employee", employeeRoutes);

// CRM / Clientes y Reservas
app.use("/customers", customersRoutes);
app.use("/aditionalServices", aditionalServicesRoutes); // Considera renombrar a /additional-services
app.use("/reservations", reservationsRoutes);
app.use("/reservationServices", reservationServicesRoutes); // Considera /reservation-services

// Compras y Proveedores/Insumos
app.use("/provider", providerRoutes); // ¿Para proveedores de la empresa?
app.use("/supplies", supplyRoutes);
app.use("/registerPurchase", registerPurchaseRoutes); // Considera /purchases
app.use("/purchaseDetail", purchaseDetailRoutes); // Considera /purchase-details o anidar bajo /purchases

// Producción y Fichas Técnicas
app.use("/product", productRoutes); // Considera /products
app.use("/specSheet", specSheetRoutes); // Considera /spec-sheets
app.use("/spec-sheet-processes", specSheetProcessRoutes); // Montaje para los procesos de una ficha técnica
// app.use("/productSheet", productSheetRoutes); // REEMPLAZADO, se usará specSheetSupplyRoutes
app.use("/spec-sheet-supplies", specSheetSupplyRoutes); // Montaje para los insumos de una ficha técnica
app.use("/process", processRoutes);   // Para Procesos Maestros, considera /master-processes
// app.use("/processDetail", processDetailRoutes); // ¿Dónde encaja mejor? ¿Es parte de /process o /production-order?

app.use("/production-orders", productionOrderRoutes); // Ruta base para Órdenes de Producción

// Para ProductionOrderDetailRoutes y ProductionOrderSupplyRoutes,
// dado que contienen rutas como "/production-orders/:idProductionOrder/..."
// la forma más directa de que funcionen como están escritas es montarlas en la raíz O
// refactorizar sus rutas internas para que sean relativas a un punto de montaje.
//
// Opción A: Montar en raíz (puede causar conflictos si hay rutas genéricas)
// app.use('/', productionOrderDetailRoutes); // CUIDADO: rutas como /:idProductionOrderDetail podrían chocar
// app.use('/', productionOrderSupplyRoutes); // CUIDADO
//
// Opción B: Montar con prefijo y aceptar las rutas largas (más seguro y explícito)
// Si productionOrderDetailRoutes tiene rutas como /:idProductionOrderDetail, el montaje base tiene sentido.
// Para las rutas que ya tienen /production-orders/... DENTRO del router, se volverán más largas.
// Ejemplo: /production-order-details/production-orders/:idProductionOrder/steps
app.use("/production-order-details", productionOrderDetailRoutes);
app.use("/production-order-supplies", productionOrderSupplyRoutes);

// --- Gastos ---
app.use("/conceptSpent", expenseCategoryRoutes); // Manteniendo tu nombre original para Tipos/Categorías de Gasto
app.use("/specificConceptSpent", specificConceptSpentRoutes); // Para Conceptos Específicos
app.use("/monthlyOverallExpense", monthlyOverallExpenseRoutes); // Para Gastos Mensuales

console.log("BACKEND: Todas las rutas principales montadas.");

// --- Manejo de Errores ---
app.use((req, res, next) => {
  res.status(404).json({ message: "Recurso no encontrado en el servidor." });
});

app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Ha ocurrido un error inesperado en el servidor.",
    // error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
  });
});

module.exports = app;   