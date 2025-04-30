const { validationResult } = require('express-validator');
const aditionalServicesService = require('../services/aditionalServicesService');

const createAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const aditionalServices = await aditionalServicesService.createAditionalServices(req.body);
        res.status(201).json(aditionalServices);
    } catch (error) {
        // Loguear el error real en el servidor
        console.error('Error en createAditionalServices:', error);
        // Enviar un error genérico al cliente (podría ser 400 si es error de datos, 500 si es interno)
        res.status(500).json({ message: error.message || 'Error al crear el servicio adicional.' });
    }
};

const getAllAditionalServices = async (req, res) => {
    try {
        const aditionalServices = await aditionalServicesService.getAllAditionalServices();
        res.status(200).json(aditionalServices);
    } catch (error) {
        console.error('Error en getAllAditionalServices:', error);
        res.status(500).json({ message: error.message || 'Error al obtener los servicios adicionales.' });
    }
};

const getAditionalServicesById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Errores de validación del ID en la ruta
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const aditionalServices = await aditionalServicesService.getAditionalServicesById(req.params.id);
        // Considerar manejar el caso en que el servicio no se encuentre (podría devolver null o tirar error)
        if (!aditionalServices) {
            return res.status(404).json({ message: 'Servicio adicional no encontrado.' });
        }
        res.status(200).json(aditionalServices);
    } catch (error) {
        console.error(`Error en getAditionalServicesById (ID: ${req.params.id}):`, error);
        res.status(500).json({ message: error.message || 'Error al obtener el servicio adicional.' });
    }
};

const updateAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Errores de validación de los datos del body o el ID
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Intenta actualizar el servicio
        await aditionalServicesService.updateAditionalServices(req.params.id, req.body);

        
        // Envía SÓLO UNA respuesta en caso de éxito.
        // 204 No Content es apropiado para actualizaciones exitosas sin devolver datos.
        res.status(204).end();

        // Se elimina la siguiente línea que causaba el error:
        // res.status(200).json({ message: 'Servicio adicional actualizado correctamente' });

    } catch (error) {
        console.error(`Error en updateAditionalServices (ID: ${req.params.id}):`, error);
        // Usar 500 para errores internos del servidor durante la actualización
        res.status(500).json({ message: error.message || 'Error al actualizar el servicio adicional.' });
    }
};

const deleteAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await aditionalServicesService.deleteAditionalServices(req.params.id);
        // La respuesta 200 con mensaje es válida, aunque 204 también es común para DELETE
        res.status(200).json({
            success: true,
            message: "Servicio adicional eliminado exitosamente"
        });
    } catch (error) {
        console.error(`Error en deleteAditionalServices (ID: ${req.params.id}):`, error);
        // Considerar si el error es porque no existe (404) o un fallo interno (500)
        res.status(500).json({
            success: false,
            message: error.message || 'Error al eliminar el servicio adicional.'
        });
    }
};

const changeStateAditionalServices = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Asegúrate de que el servicio exista antes o maneja el error si no existe
        await aditionalServicesService.changeStateAditionalServices(req.params.id, req.body.status);
        // 204 No Content es adecuado aquí
        res.status(204).end();
    } catch (error) {
        console.error(`Error en changeStateAditionalServices (ID: ${req.params.id}):`, error);
        res.status(500).json({ message: error.message || 'Error al cambiar el estado del servicio adicional.' });
    }
};

module.exports = {
    createAditionalServices,
    getAllAditionalServices,
    getAditionalServicesById,
    updateAditionalServices,
    deleteAditionalServices,
    changeStateAditionalServices,
};