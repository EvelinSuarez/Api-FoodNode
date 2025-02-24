const express = require('express');
const app = express();

app.use(express.json());

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

module.exports = app;