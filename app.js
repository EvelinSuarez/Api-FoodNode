const express = require('express');
const app = express();

app.use(express.json());

const employeeRoutes = require('./routes/employeeRoutes');
const providerRoutes = require('./routes/providerRoutes');

app.use('/employee', employeeRoutes);
app.use('/provider', providerRoutes);

module.exports = app;