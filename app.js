const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ], // Agrega los posibles orígenes de tu frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Añadido OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- Rutas existentes ---
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Montaje duplicado de userRoutes y authRoutes (manteniendo tu estructura original)
// app.use("/users", userRoutes); // Comentado porque ya se monta más abajo
// app.use("/auth", authRoutes);   // Comentado porque ya se monta más abajo

const employeeRoutes = require("./routes/employeeRoutes");
const providerRoutes = require("./routes/providerRoutes");

// --- RUTAS DE GASTOS - ESTRUCTURA ACTUALIZADA ---
// 1. Rutas para los Tipos de Gasto Generales (lo que antes era tu 'conceptSpentRoutes')
//    Asegúrate de que el archivo 'expenseTypeRoutes.js' exista y contenga las rutas para ExpenseType.
//    Si renombraste tu 'conceptSpentRoutes.js' a 'expenseTypeRoutes.js', esta línea es correcta.
const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes"); // ANTES: const conceptSpentRoutes = require("./routes/conceptSpentRoutes");

// 2. Rutas para los Conceptos de Gasto Específicos (NUEVA ENTIDAD)
//    Asegúrate de que el archivo 'specificConceptSpentRoutes.js' exista.
const specificConceptSpentRoutes = require("./routes/specificConceptSpentRoutes"); // NUEVA RUTA

// 3. Rutas para los Gastos Mensuales Generales (que manejan los ítems internamente)
const monthlyOverallExpenseRoutes = require("./routes/monthlyOverallExpenseRoutes");
// --- FIN RUTAS DE GASTOS ---

const customersRoutes = require("./routes/customersRoutes");
console.log("BACKEND: Montando /api/roles..."); // Manteniendo tu log
const roleRoutes = require("./routes/roleRoutes");
console.log("BACKEND: /api/roles montado.");    // Manteniendo tu log
const permissionRoutes = require("./routes/permissionRoutes");
const privilegeRoutes = require("./routes/privilegeRoutes");
const aditionalServicesRoutes = require("./routes/aditionalServicesRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const specSheetRoutes = require("./routes/specSheetRoutes");
const rolePrivilegesRoutes = require("./routes/rolePrivilegesRoutes");
const registerPurchaseRoutes = require("./routes/registerPurchaseRoutes");
const purchaseDetailRoutes = require("./routes/purchaseDetailRoutes");
const productSheetRoutes = require("./routes/productSheetRoutes");
const processRoutes = require("./routes/processRoutes");
const processDetailRoutes = require("./routes/processDetailRoutes");
const productionOrderRoutes = require("./routes/productionOrderRoutes");
const reservationServicesRoutes = require("./routes/reservationServicesRoutes");

// --- Montaje de Rutas (manteniendo tu estructura original, sin prefijo /api global) ---
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.use("/employee", employeeRoutes);
app.use("/provider", providerRoutes);

// --- MONTAJE DE RUTAS DE GASTOS ACTUALIZADAS ---
// 1. Montaje para Tipos de Gasto Generales
//    Si tu frontend llamaba a "/conceptSpent" para los tipos generales, puedes mantener ese endpoint
//    y apuntarlo al nuevo router de 'expenseTypeRoutes'.
//    O puedes cambiar el endpoint si prefieres. Aquí mantengo "/conceptSpent" apuntando a los tipos generales.
app.use("/conceptSpent", expenseCategoryRoutes); // Ruta para los Tipos de Gasto Generales (antes tu 'conceptSpent')

// 2. Montaje para Conceptos de Gasto Específicos (NUEVA RUTA)
//    Este es un nuevo endpoint para la nueva entidad.
app.use("/specificConceptSpent", specificConceptSpentRoutes); // Ruta para los Conceptos Específicos

// 3. Montaje para Gastos Mensuales Generales (sin cambios en el montaje)
app.use("/monthlyOverallExpense", monthlyOverallExpenseRoutes);
// --- FIN MONTAJE RUTAS DE GASTOS ---

app.use("/customers", customersRoutes);
app.use("/role", roleRoutes); // Nota: tus logs decían /api/roles, pero aquí lo montas en /role
app.use("/permission", permissionRoutes);
app.use("/privilege", privilegeRoutes);
app.use("/aditionalServices", aditionalServicesRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/supplier", supplierRoutes);
app.use("/product", productRoutes);
app.use("/specSheet", specSheetRoutes);
app.use("/rolePrivileges", rolePrivilegesRoutes);
app.use("/registerPurchase", registerPurchaseRoutes);
app.use("/purchaseDetail", purchaseDetailRoutes);
app.use("/productSheet", productSheetRoutes);
app.use("/process", processRoutes);
app.use("/processDetail", processDetailRoutes);
app.use("/productionOrder", productionOrderRoutes);
app.use("/reservationServices", reservationServicesRoutes);

// --- Manejo de Errores Básico (Opcional, pero recomendado) ---
// Ruta para 404 (Not Found) - debe ir después de todas las demás rutas
app.use((req, res, next) => {
  res.status(404).json({ message: "Recurso no encontrado." }); // Mensaje más genérico
});

// Middleware de manejo de errores global - debe ir al final
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err.stack || err); // Loguear el error
  res.status(err.status || 500).json({
    message: err.message || "Ha ocurrido un error inesperado.",
    // error: process.env.NODE_ENV === 'development' ? err.stack : undefined // Mostrar stack en desarrollo
  });
});

module.exports = app;