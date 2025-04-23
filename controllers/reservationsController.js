const { validationResult } = require('express-validator');
const Reservations = require('../models/reservations');
const Customers = require('../models/customers');
const AditionalServices = require('../models/aditionalServices');

/**
 * Crear una nueva reserva
 */
const createReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    
    // Verificar idCustomers
    if (!req.body.idCustomers && req.body.idCustomers !== 0) {
      return res.status(400).json({ message: "ID de cliente es requerido" });
    }
    
    try {
      // Asegurarse de que idCustomers sea un número
      req.body.idCustomers = Number(req.body.idCustomers);
      
      // Crear la reserva
      const reservations = await Reservations.create(req.body);
      
      // Si hay servicios adicionales, asociarlos
      if (req.body.idAditionalServices && Array.isArray(req.body.idAditionalServices)) {
        await reservations.setAditionalServices(req.body.idAditionalServices);
      }
      
      // Obtener la reserva con sus relaciones
      const reservationWithRelations = await Reservations.findByPk(reservations.idReservations, {
        include: [
          { model: Customers, as: 'Customer' },
          { model: AditionalServices, as: 'AditionalServices' }
        ]
      });
      
      res.status(201).json(reservationWithRelations);
    } catch (error) {
      console.error("Error al crear la reserva:", error.message);
      res.status(400).json({ message: error.message });
    }
}

/**
 * Obtener todas las reservas
 */
const getAllReservations = async (req, res) => {
    try {
        console.log("Obteniendo todas las reservas...");
        
        // Obtener todas las reservas con información básica
        const reservations = await Reservations.findAll({
            include: [
                {
                    model: Customers,
                    as: 'Customer',
                    attributes: ['idCustomers', 'fullName', 'distintive', 'customerCategory']
                }
            ]
        });
        
        console.log(`Se encontraron ${reservations.length} reservas`);
        res.status(200).json(reservations);
    } catch (error) {
        console.error("Error al obtener las reservas:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener una reserva por ID
 */
// En tu archivo reservationsController.js

const getReservationsById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[getReservationsById] Obteniendo reserva con ID: ${id}`);
        
        const reservation = await Reservations.findOne({
            where: { idReservations: id },
            include: [
                {
                    model: Customers,
                    as: 'Customer',
                    required: false
                },
                {
                    model: AditionalServices,
                    as: 'AditionalServices',
                    required: false,
                    through: { attributes: [] }
                }
            ]
        });

        if (!reservation) {
            console.log(`[getReservationsById] Reserva con ID ${id} no encontrada`);
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Verificar el campo pass directamente en la base de datos
        console.log(`[getReservationsById] Valor original de pass:`, JSON.stringify(reservation.pass, null, 2));
        console.log(`[getReservationsById] Tipo de pass:`, typeof reservation.pass);

        // Verificar si el campo pass existe y tiene el formato correcto
        if (!reservation.pass) {
            console.log(`[getReservationsById] Reserva ${id} no tiene campo pass, inicializando como array vacío`);
            reservation.pass = [];
        } else if (typeof reservation.pass === 'string') {
            // Si pass es una cadena JSON, intentar parsearlo
            try {
                console.log(`[getReservationsById] Reserva ${id} tiene pass como string, intentando parsear:`, reservation.pass);
                reservation.pass = JSON.parse(reservation.pass);
            } catch (parseError) {
                console.error(`[getReservationsById] Error al parsear pass para reserva ${id}:`, parseError);
                reservation.pass = [];
            }
        } else if (!Array.isArray(reservation.pass)) {
            // Si pass no es un array, convertirlo a array
            console.log(`[getReservationsById] Reserva ${id} tiene pass en formato incorrecto, convirtiendo a array`);
            reservation.pass = [];
        }

        // Asegurarse de que cada elemento del array tenga la estructura correcta
        if (Array.isArray(reservation.pass)) {
            reservation.pass = reservation.pass.map(abono => {
                if (!abono || typeof abono !== 'object') {
                    return { fecha: '', cantidad: 0 };
                }
                return {
                    fecha: abono.fecha || '',
                    cantidad: abono.cantidad || 0
                };
            });
        }

        console.log(`[getReservationsById] Reserva ${id} cargada exitosamente con pass:`, JSON.stringify(reservation.pass, null, 2));
        return res.status(200).json(reservation);
        
    } catch (error) {
        console.error("[getReservationsById] Error al obtener el detalle de la reserva:", error);
        return res.status(500).json({ 
            message: 'Error al obtener el detalle de la reserva',
            error: error.message
        });
    }
};

/**
 * Actualizar una reserva
 */
const updateReservations = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[updateReservations] Iniciando actualización de reserva con ID: ${id}`);
        console.log(`[updateReservations] Datos recibidos:`, JSON.stringify(req.body, null, 2));
        
        // Verificar que la reserva existe
        const reservation = await Reservations.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        // Crear una copia de los datos para modificar
        const dataToUpdate = { ...req.body };
        
        // Procesar el campo pass explícitamente
        if (dataToUpdate.pass !== undefined) {
            console.log(`[updateReservations] Campo pass recibido:`, JSON.stringify(dataToUpdate.pass, null, 2));
            
            // Asegurarse de que pass sea un array
            if (!Array.isArray(dataToUpdate.pass)) {
                try {
                    if (typeof dataToUpdate.pass === 'string') {
                        dataToUpdate.pass = JSON.parse(dataToUpdate.pass);
                    } else {
                        dataToUpdate.pass = [];
                    }
                } catch (error) {
                    console.log(`[updateReservations] Error al parsear pass:`, error);
                    dataToUpdate.pass = [];
                }
            }
            
            // Validar cada elemento del array pass
            dataToUpdate.pass = dataToUpdate.pass.map(abono => ({
                fecha: abono.fecha || '',
                cantidad: Number(abono.cantidad) || 0
            }));
            
            console.log(`[updateReservations] Campo pass procesado:`, JSON.stringify(dataToUpdate.pass, null, 2));
        }
        
        console.log(`[updateReservations] Datos procesados para actualizar:`, JSON.stringify(dataToUpdate, null, 2));
        
        // Actualizar la reserva
        await reservation.update(dataToUpdate);
        
        // Verificar que el campo pass se haya actualizado correctamente
        const updatedReservation = await Reservations.findByPk(id);
        console.log(`[updateReservations] Campo pass después de actualizar:`, JSON.stringify(updatedReservation.pass, null, 2));
        
        // Si hay servicios adicionales, actualizarlos
        if (dataToUpdate.idAditionalServices && Array.isArray(dataToUpdate.idAditionalServices)) {
            await reservation.setAditionalServices(dataToUpdate.idAditionalServices);
        }
        
        // Obtener la reserva actualizada con sus relaciones
        const reservationWithRelations = await Reservations.findByPk(id, {
            include: [
                { model: Customers, as: 'Customer' },
                { model: AditionalServices, as: 'AditionalServices' }
            ]
        });
        
        console.log(`[updateReservations] Reserva ${id} actualizada correctamente`);
        return res.status(200).json(reservationWithRelations);
    } catch (error) {
        console.log(`[updateReservations] Error:`, error);
        return res.status(500).json({ 
            message: 'Error al actualizar la reserva',
            error: error.message
        });
    }
};
/**
 * Eliminar una reserva
 */
const deleteReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    
    try {
        const { id } = req.params;
        
        // Verificar que la reserva existe
        const reservation = await Reservations.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        // Eliminar la reserva
        await reservation.destroy();
        
        res.status(200).json({ 
            success: true,
            message: "Reserva eliminada exitosamente" 
        });
    } catch (error) {
        console.error("Error al eliminar la reserva:", error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Cambiar el estado de una reserva
 */
const changeStateReservations = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Verificar que la reserva existe
        const reservation = await Reservations.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        // Actualizar el estado
        await reservation.update({ status });
        
        res.status(200).json({
            success: true,
            message: "Estado de la reserva actualizado correctamente"
        });
    } catch (error) {
        console.error("Error al cambiar el estado de la reserva:", error);
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createReservations,
    getAllReservations,
    getReservationsById,
    updateReservations,
    deleteReservations,
    changeStateReservations,
};