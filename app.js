const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();         

    
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Agrega los posibles orígenes de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');



app.use('/users', userRoutes);          
app.use('/api/auth', authRoutes);

        

const employeeRoutes = require('./routes/employeeRoutes');
const providerRoutes = require('./routes/providerRoutes');
const conceptSpentRoutes = require('./routes/conceptSpentRoutes');
const monthlyOverallExpenseRoutes = require('./routes/monthlyOverallExpenseRoutes');
const customersRoutes = require('./routes/customersRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const privilegeRoutes = require('./routes/privilegeRoutes');
const aditionalServicesRoutes = require('./routes/aditionalServicesRoutes');
const reservationsRoutes = require('./routes/reservationsRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const specSheetRoutes = require('./routes/spechsheetRoutes');
const rolePrivilegesRoutes = require("./routes/rolePrivilegesRoutes")
const registerPurchaseRoutes = require('./routes/registerPurchaseRoutes');
const purchaseDetailRoutes = require('./routes/purchaseDetailRoutes');
const productSheetRoutes = require('./routes/productSheetRoutes');
const processRoutes = require('./routes/processRoutes');
const processDetailRoutes = require('./routes/processDetailRoutes');
const productionOrderRoutes = require('./routes/productionOrderRoutes');


app.use('/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use('/employee', employeeRoutes);
app.use('/provider', providerRoutes);
app.use('/conceptSpent', conceptSpentRoutes);
app.use('/monthlyOverallExpense', monthlyOverallExpenseRoutes);
app.use('/customers', customersRoutes);
app.use('/role', roleRoutes);
app.use('/permission', permissionRoutes);
app.use('/privilege', privilegeRoutes);
app.use('/aditionalServices', aditionalServicesRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/supplier', supplierRoutes);
app.use('/product', productRoutes);
app.use('/specSheet', specSheetRoutes);
app.use('/rolePrivileges', rolePrivilegesRoutes)
app.use('/registerPurchase', registerPurchaseRoutes);
app.use('/purchaseDetail', purchaseDetailRoutes);
app.use('/productSheet', productSheetRoutes);
app.use('/process', processRoutes);
app.use('/processDetail', processDetailRoutes);
app.use('/productionOrder', productionOrderRoutes);





module.exports = app;
