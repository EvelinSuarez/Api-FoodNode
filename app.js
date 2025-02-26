const express = require('express');
const app = express();

dotenv.config();

app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');



app.use('/users', userRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Ruta protegida', user: req.user });
});

module.exports = app;