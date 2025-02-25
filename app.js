const express = require('express');
const app = express();

app.use(express.json());

const employeeRoutes = require('./routes/employeeRoutes');
const providerRoutes = require('./routes/providerRoutes');
const purchaseRecordRoutes = require('./routes/purchaseRecordRoutes');
const conceptSpentRoutes = require('./routes/conceptSpentRoutes');
const monthlyOverallExpenseRoutes = require('./routes/monthlyOverallExpenseRoutes');
const customersRoutes = require('./routes/customersRoutes');


app.use('/employee', employeeRoutes);
app.use('/provider', providerRoutes);
app.use('/purchaseRecord', purchaseRecordRoutes);
app.use('/conceptSpent', conceptSpentRoutes);
app.use('/monthlyOverallExpense', monthlyOverallExpenseRoutes);
app.use('/customers', customersRoutes);


module.exports = app;