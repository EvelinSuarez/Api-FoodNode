const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('food_node', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;