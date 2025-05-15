    const { validationResult } = require('express-validator');
    const processDetailService = require('../services/processDetailService');

    const createProcessDetail = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const processDetail = await processDetailService.createProcessDetail(req.body);
            res.status(201).json(processDetail);
        } catch (error) {
            console.error("Error al crear detalle de proceso:", error);
            res.status(400).json({ message: error.message });
        }
    }
    const getProcessDetailsByProductionOrder = async (req, res) => {
        // Si usas express-validator para validar el parámetro idOrder:
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }
        try {
            const { idOrder } = req.params; // Asume que la ruta será algo como /order/:idOrder
            if (!idOrder || isNaN(parseInt(idOrder, 10))) { // Validación básica del ID
                return res.status(400).json({ message: "ID de orden de producción válido es requerido." });
            }
            // Llamar al método correspondiente en el servicio del backend
            const processDetails = await processDetailService.getProcessDetailsByProductionOrder(parseInt(idOrder, 10));
            if (!processDetails) {
                // El servicio podría devolver null o un array vacío.
                // Si devuelve null para "no encontrado" (aunque findAll usualmente devuelve array vacío):
                // return res.status(404).json({ message: "No se encontraron detalles de proceso para esta orden." });
            }
            res.status(200).json(processDetails); // Devuelve el array (puede estar vacío)
        } catch (error) {
            console.error("Error en controller al obtener ProcessDetails por ProductionOrder:", error);
            res.status(500).json({ message: error.message || "Error al obtener detalles de proceso por orden." });
        }
    };

    const getAllProcessDetails = async (req, res) => {
        try {
            const processDetails = await processDetailService.getAllProcessDetails();
            res.status(200).json(processDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const getProcessDetailById = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const processDetail = await processDetailService.getProcessDetailById(req.params.id);
            res.status(200).json(processDetail);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const updateProcessDetail = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            await processDetailService.updateProcessDetail(req.params.id, req.body);
            res.status(204).end();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const deleteProcessDetail = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            await processDetailService.deleteProcessDetail(req.params.id);
            res.status(204).end();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const changeStateProcessDetail = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            await processDetailService.changeStateProcessDetail(req.params.id, req.body.status);
            res.status(204).end();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const getProcessDetailsByProcess = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const processDetails = await processDetailService.getProcessDetailsByProcess(req.params.idProcess);
            res.status(200).json(processDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const getProcessDetailsBySpecSheet = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const processDetails = await processDetailService.getProcessDetailsBySpecSheet(req.params.idSpecSheet);
            res.status(200).json(processDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const getProcessDetailsByEmployee = async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        try {
            const processDetails = await processDetailService.getProcessDetailsByEmployee(req.params.idEmployee);
            res.status(200).json(processDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    const getActiveProcessDetails = async (req, res) => {
        try {
            const processDetails = await processDetailService.getActiveProcessDetails();
            res.status(200).json(processDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    module.exports = {
        createProcessDetail,
        getAllProcessDetails,
        getProcessDetailById,
        getProcessDetailsByProductionOrder,
        updateProcessDetail,
        deleteProcessDetail,
        changeStateProcessDetail,
        getProcessDetailsByProcess,
        getProcessDetailsBySpecSheet,
        getProcessDetailsByEmployee,
        getActiveProcessDetails
    };