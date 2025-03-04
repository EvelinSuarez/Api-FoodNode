const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config(); // Cargar variables de entorno          
// dotenv.config();
    
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Agrega los posibles orígenes de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const employeeRoutes = require('./routes/employeeRoutes');
const providerRoutes = require('./routes/providerRoutes');
const purchaseRecordRoutes = require('./routes/purchaseRecordRoutes');
const conceptSpentRoutes = require('./routes/conceptSpentRoutes');
const monthlyOverallExpenseRoutes = require('./routes/monthlyOverallExpenseRoutes');
const customersRoutes = require('./routes/customersRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const privilegeRoutes = require('./routes/privilegeRoutes');
const aditionalServicesRoutes = require('./routes/aditionalServicesRoutes');
const reservationsRoutes = require('./routes/reservationsRoutes');



app.use('/users', userRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Ruta protegida', user: req.user });
});
app.use('/employee', employeeRoutes);
app.use('/provider', providerRoutes);
app.use('/purchaseRecord', purchaseRecordRoutes);
app.use('/conceptSpent', conceptSpentRoutes);
app.use('/monthlyOverallExpense', monthlyOverallExpenseRoutes);
app.use('/customers', customersRoutes);
app.use('/role', roleRoutes);
app.use('/permission', permissionRoutes);
app.use('/privilege', privilegeRoutes);
app.use('/aditionalServices', aditionalServicesRoutes);
app.use('/reservations', reservationsRoutes);


module.exports = app;
