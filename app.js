// app.js (Versión Final y Completa para Vercel)

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// --- PASO 1: INICIALIZAR LA BASE DE DATOS Y LOS MODELOS --- // <<< AÑADIR ESTO
// Al hacer require('.../models'), se ejecuta el archivo index.js de esa carpeta.
// Esto carga todos los modelos, define todas las asociaciones y nos devuelve
// un objeto 'db' con todo lo que necesitamos para operar.
const db = require('./models'); // Asegúrate que la ruta a tu carpeta 'models' sea correcta.

// --- PASO 2: VERIFICAR LA CONEXIÓN (MUY RECOMENDADO) --- // <<< AÑADIR ESTO
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a la base de datos:', err);
  });
//-------------------------------------------------------------

// --- CONFIGURACIÓN DE CORS PARA VERCEL ---
const whitelist = [
  'https://food-in-production-react.vercel.app', // Tu frontend en producción
  'http://localhost:3000', // Tu frontend en desarrollo local (si usas puerto 3000)
  'http://localhost:5173',  // Tu frontend en desarrollo local con Vite (puerto común)
  'http://10.0.2.2:3000'
];

const corsOptions = {
  // La función origin comprueba si quien hace la petición está en nuestra lista blanca
  origin: '*',
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
const dashboardRoutes = require('./routes/dashboardRoutes'); 

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
app.use('/dashboard', dashboardRoutes);
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

const { exec } = require('child_process');

async function runSeedersIfNeeded() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🌱 Ejecutando seeders en entorno de producción...');
    exec('npx sequelize-cli db:seed:all --env production', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error ejecutando seeders:', error.message);
        return;
      }
      if (stderr) console.error('⚠️ Seeder stderr:', stderr);
      console.log('✅ Seeders ejecutados correctamente:\n', stdout);
    });
  } else {
    console.log('🧩 Entorno de desarrollo: los seeders no se ejecutan automáticamente.');
  }
}

// Llama a la función justo antes de iniciar el servidor
runSeedersIfNeeded();


const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await db.sequelize.sync({ alter: true }); 
    console.log('✅ Base de datos sincronizada correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    process.exit(1);
  }
}


startServer();