const Customers = require('../models/customers');
const { Op } = require("sequelize"); // Importar Sequelize para usar operadores lógicos

const createCustomers = async (customers) => {
    return Customers.create(customers);
}

const getAllCustomers = async () => {
    return Customers.findAll();
}

const getCustomersById = async (idCustomers) => {
    return Customers.findByPk(idCustomers);
}

const updateCustomers = async (idCustomers, customers) => {
    return Customers.update(customers, { where: { idCustomers } });
}

const deleteCustomers = async (idCustomers) => {
    return Customers.destroy({ where: { idCustomers } });
}

const changeStateCustomers = async (idCustomers, status) => {
    return Customers.update({ status: status }, { where: { idCustomers } });
}
// Método para buscar clientes
const searchCustomers = async (searchTerm) => {
    try {
        const customers = await Customers.findAll({
            where: {
                [Op.or]: [
                    { fullName: { [Op.like]: `%${searchTerm}%` } }, // Busca por nombre
                    { distintive: { [Op.like]: `%${searchTerm}%` } }, // Busca por distintivo
                    { email: { [Op.like]: `%${searchTerm}%` } } // Busca por correo
                ]
            }
        });

        return customers; // Devuelve los resultados (puede ser un array vacío)
    } catch (error) {
        throw new Error(error.message); // Lanza errores de la base de datos
    }
};


module.exports = {
    createCustomers,
    getAllCustomers,
    getCustomersById,
    updateCustomers,
    deleteCustomers,
    changeStateCustomers,
    searchCustomers,
};