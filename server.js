const app = require('./app');
const sequelize = require('./config/database');
const PORT = 3000;

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});