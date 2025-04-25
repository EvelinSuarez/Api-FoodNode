const { validationResult } = require('express-validator');
const customersService = require('../services/customersService');

const createCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const customers = await customersService.createCustomers(req.body);
        res.status(201).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllCustomers = async (req, res) => {
    try {
        const customers = await customersService.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getCustomersById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const customers = await customersService.getCustomersById(req.params.id);
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// EN controllers/customersController.js (CORREGIDO)
const updateCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const customerId = req.params.id;
        const customerData = req.body;

        await customersService.updateCustomers(customerId, customerData);

        // Envía UNA ÚNICA respuesta de éxito: 204 No Content
        res.status(204).end();
        // ELIMINA la línea: res.status(200).json({ message: 'Cliente actualizado correctamente' });

    } catch (error) {
         console.error(`Error en updateCustomers (ID: ${req.params.id}):`, error); // Es buena idea loguear el error en el servidor

         // Considera mejorar el manejo de errores aquí también
         // (Ej: devolver 404 si el servicio indica "no encontrado", 500 para otros errores)

        // Por ahora, mantenemos el 400, pero con log:
        res.status(400).json({ message: error.message || 'Error al actualizar el cliente.' }); // Añadir mensaje por defecto
    }
}
const deleteCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await customersService.deleteCustomers(req.params.id);
        res.status(200).json({ 
            success: true,
            message: "Cliente eliminado exitosamente" 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}


const changeStateCustomers = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        await customersService.changeStateCustomers(req.params.id, req.body.status);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
const searchCustomers = async (req, res) => {
    // 1. Validar si hay errores detectados por el middleware (customersValidations.searchCustomersValidation)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Si la validación falla (ej: 'term' es muy corto o falta), devuelve 400
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 2. Obtener el término de búsqueda de los PARÁMETROS DE CONSULTA (query parameters)
        //    Asegúrate que el frontend envía el parámetro como 'term' (ej: /search?term=Angela)
        const { term } = req.query;

        // 3. (Opcional pero recomendado) Verificar si 'term' realmente existe, por si la validación no lo hizo obligatorio
        if (!term) {
             // Esto no debería pasar si la validación requiere 'term', pero es una salvaguarda
             return res.status(400).json({ message: 'El parámetro de búsqueda "term" es requerido.' });
        }

        // 4. Llamar al SERVICIO con la variable correcta ('term')
        console.log(`Buscando clientes con término: ${term}`); // Log útil para el servidor
        const customers = await customersService.searchCustomers(term); // <-- ¡Usar 'term'!

        // 5. Enviar la respuesta exitosa (200 OK) con los clientes encontrados (puede ser un array vacío)
        res.status(200).json(customers);

    } catch (error) {
        // 6. Manejar errores INTERNOS del servidor (ej: error de base de datos en el servicio)
        console.error('Error en searchCustomers controller:', error); // ¡Loguear el error en el servidor es crucial!
        // Devolver un error 500 (Internal Server Error) porque el problema no es la solicitud del cliente (ya pasó la validación)
        res.status(500).json({ message: 'Error interno del servidor al buscar clientes.' });
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