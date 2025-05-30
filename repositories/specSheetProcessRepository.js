const db = require("../models");
const { SpecSheetProcess, Process, SpecSheet, sequelize } = db; // Incluir Process y SpecSheet si se usan en includes
const { Op } = require('sequelize');

const create = async (processData, transaction = null) => {
    try {
        // Campos esperados: idSpecSheet, idProcess, processOrder,
        // processNameOverride, processDescriptionOverride, estimatedTimeMinutes
        return await SpecSheetProcess.create(processData, { transaction });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Asumiendo que tienes un índice unique en (idSpecSheet, processOrder) o (idSpecSheet, idProcess)
            // O la validación de processOrder ya lo previno.
            throw new db.exports.BadRequestError(`Conflicto de datos: ${error.errors?.[0]?.message || 'El orden del proceso ya existe para esta ficha o el proceso ya fue añadido.'}`);
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new db.exports.BadRequestError(`Error de referencia: ${error.fields.join(', ')} no es válido(s).`);
        }
        console.error("Repo[SpecSheetProcess]: Error al crear proceso:", error);
        throw error; // Re-lanzar para que el servicio lo maneje
    }
};

const findAllBySpecSheetId = async (idSpecSheet) => {
    return SpecSheetProcess.findAll({
        where: { idSpecSheet: parseInt(idSpecSheet) },
        include: [ // Opcional: incluir datos del proceso maestro
            {
                model: Process, // Modelo del proceso maestro
                as: 'masterProcessData', // Alias definido en la asociación
                attributes: ['idProcess', 'processName', 'description'] // Campos que quieres del maestro
            }
        ],
        order: [['processOrder', 'ASC']],
    });
};

const findById = async (idSpecSheetProcess) => {
    return SpecSheetProcess.findByPk(parseInt(idSpecSheetProcess), {
        include: [
            { model: Process, as: 'masterProcessData', attributes: ['idProcess', 'processName', 'description'] },
            { model: SpecSheet, as: 'specSheet', attributes: ['idSpecSheet', 'specSheetCode'] } // Alias para SpecSheet
        ]
    });
};

const update = async (idSpecSheetProcess, updateData, transaction = null) => {
    const sspId = parseInt(idSpecSheetProcess);
    
    // Filtrar campos no modificables (idSpecSheet, idProcess ya validados para no estar en req.body)
    const allowedUpdates = ['processOrder', 'processNameOverride', 'processDescriptionOverride', 'estimatedTimeMinutes'];
    const dataToUpdate = {};
    for (const key of allowedUpdates) {
        if (updateData.hasOwnProperty(key)) {
            dataToUpdate[key] = updateData[key];
        }
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return [0]; // No hay datos válidos para actualizar
    }

    try {
        const [affectedRows] = await SpecSheetProcess.update(dataToUpdate, {
            where: { idSpecSheetProcess: sspId },
            transaction
        });
        return [affectedRows]; // Devuelve [affectedRows]
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new db.exports.BadRequestError(`Conflicto de datos: ${error.errors?.[0]?.message || 'El orden del proceso ya existe para esta ficha.'}`);
        }
        console.error("Repo[SpecSheetProcess]: Error al actualizar proceso:", error);
        throw error;
    }
};

const destroy = async (idSpecSheetProcess, transaction = null) => {
    const sspId = parseInt(idSpecSheetProcess);
    try {
        return await SpecSheetProcess.destroy({
            where: { idSpecSheetProcess: sspId },
            transaction
        }); // Devuelve número de filas eliminadas
    } catch (error) {
        console.error("Repo[SpecSheetProcess]: Error al eliminar proceso:", error);
        throw error;
    }
};

// Funciones para bulk operations usadas por specSheetsService (sin cambios mayores, pero revisar si usan BadRequestError)
const bulkCreate = async (specSheetProcessItems, options = {}) => { // Cambiado
  try {
    if (!specSheetProcessItems || specSheetProcessItems.length === 0) {
        return [];
    }
    const bulkCreateOptions = {
      validate: true,
      ...options
    };
    return await SpecSheetProcess.bulkCreate(specSheetProcessItems, bulkCreateOptions);
  } catch (error) {
    // ... (tu manejo de errores existente) ...
    console.error("Repo[SpecSheetProcess]: Error al crear SpecSheetProcesses en bulk:", error);
    throw error;
  }
};

const destroyBySpecSheetId = async (idSpecSheet, transaction = null) => {
    try {
        return await SpecSheetProcess.destroy({
            where: { idSpecSheet: parseInt(idSpecSheet) },
            transaction
        });
    } catch (error) {
        console.error(`Repo[SpecSheetProcess]: Error al eliminar SpecSheetProcesses para idSpecSheet ${idSpecSheet}:`, error);
        throw error;
    }
};

module.exports = {
  create,
  findAllBySpecSheetId,
  findById,
  update,
  destroy,
  bulkCreate, // Renombrado para claridad
  destroyBySpecSheetId, // Renombrado para claridad
};