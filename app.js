// app.js (Versión Final y Completa para Vercel)

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// --- CONFIGURACIÓN DE CORS PARA VERCEL ---
const whitelist = [
  'https://food-in-production-react.vercel.app', // Tu frontend en producción
  'http://localhost:3000', // Tu frontend en desarrollo local (si usas puerto 3000)
  'http://localhost:5173'  // Tu frontend en desarrollo local con Vite (puerto común)
];

const corsOptions = {
  // La función origin comprueba si quien hace la petición está en nuestra lista blanca
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      // Si está en la lista (o es una petición sin origen como Postman), le damos permiso
      callback(null, true);
    } else {
      // Si no está en la lista, denegamos el acceso
      callback(new Error('Acceso denegado por la política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras que permitimos en las peticiones
};


app.use(cors(corsOptions));
//----------------------------------------------

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
const aditionalServicesRoutes = require("./routes/aditionalServicesRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");
const reservationServicesRoutes = require("./routes/reservationServicesRoutes");

// --- GRUPO: Compras y Proveedores/Insumos ---
const providerRoutes = require("./routes/providerRoutes");
const supplyRoutes = require("./routes/supplyRoutes");
const registerPurchaseRoutes = require("./routes/registerPurchaseRoutes");
const purchaseDetailRoutes = require("./routes/purchaseDetailRoutes");

// --- GRUPO: Producción y Fichas Técnicas ---
const productRoutes = require("./routes/productRoutes");
const specSheetRoutes = require("./routes/specSheetRoutes");
const specSheetProcessRoutes = require('./routes/specSheetProcessRoutes');
const specSheetSupplyRoutes = require('./routes/specSheetSupplyRoutes');
const processRoutes = require("./routes/processRoutes");
const productionOrderRoutes = require("./routes/productionOrderRoutes");
const productionOrderDetailRoutes = require("./routes/productionOrderDetailRoutes");
const productionOrderSupplyRoutes = require("./routes/productionOrderSupplyRoutes");

// --- GRUPO: Gastos ---
const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes");
const specificConceptSpentRoutes = require("./routes/specificConceptSpentRoutes");
const monthlyOverallExpenseRoutes = require("./routes/monthlyOverallExpenseRoutes");

// --- Montaje de Rutas ---
console.log("BACKEND: Montando rutas...");
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/role", roleRoutes);
app.use("/permission", permissionRoutes);
app.use("/privilege", privilegeRoutes);
app.use("/rolePrivileges", rolePrivilegesRoutes);
app.use("/employee", employeeRoutes);
app.use("/customers", customersRoutes);
app.use("/aditionalServices", aditionalServicesRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/reservationServices", reservationServicesRoutes);
app.use("/provider", providerRoutes);
app.use("/supplies", supplyRoutes);
app.use("/registerPurchase", registerPurchaseRoutes);
app.use("/purchaseDetail", purchaseDetailRoutes);
app.use("/product", productRoutes);
app.use("/specSheet", specSheetRoutes);
app.use("/spec-sheet-processes", specSheetProcessRoutes);
app.use("/spec-sheet-supplies", specSheetSupplyRoutes);
app.use("/process", processRoutes);
app.use("/production-orders", productionOrderRoutes);
app.use("/production-order-details", productionOrderDetailRoutes);
app.use("/production-order-supplies", productionOrderSupplyRoutes);
app.use("/conceptSpent", expenseCategoryRoutes);
app.use("/specificConceptSpent", specificConceptSpentRoutes);
app.use("/monthlyOverallExpense", monthlyOverallExpenseRoutes);
console.log("BACKEND: Todas las rutas principales montadas.");

// --- RUTA RAÍZ PARA VERIFICACIÓN ---
// Esto te permite visitar https://api-food-node.vercel.app y ver si está en línea.
// =================================================================
// RUTAS DE VERIFICACIÓN Y MANEJO DE ERRORES
// =================================================================
app.get("/", (req, res) => {
    res.status(200).json({ message: "API de FoodNode está en línea y funcionando." });
});

// --- Manejador para rutas no encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({ message: "Recurso no encontrado. Verifica la URL y el método HTTP." });
});

// --- Manejador de errores global ---
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Ha ocurrido un error inesperado en el servidor.",
  });
});

// =================================================================
// ARRANQUE DEL SERVIDOR (CRÍTICO PARA VERCEL)
// =================================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});