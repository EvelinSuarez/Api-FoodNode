// controllers/rolePrivilegesController.js
const { validationResult } = require("express-validator");
const { RolePrivilege, Role, Privilege } = require("../models"); // Asumiendo que tienes index.js exportando los modelos
// const db = require('../models'); // Otra forma de importar si usas el db object directamente

const LOG_PREFIX_RP_CONTROLLER = "[CONTROLLER RolePrivileges]";

// GET /api/roleprivileges
const getAllRolePrivileges = async (req, res) => {
  console.log(`${LOG_PREFIX_RP_CONTROLLER} getAllRolePrivileges - Solicitado.`);
  try {
    const rolePrivileges = await RolePrivilege.findAll({
        include: [ // Es útil incluir los nombres para entender qué se asignó
            { model: Role, as: 'role', attributes: ['idRole', 'roleName'] },
            {
                model: Privilege,
                as: 'privilege',
                attributes: ['idPrivilege', 'privilegeName', 'privilegeKey'],
                // Opcionalmente, incluir el Permiso al que pertenece este Privilegio
                // include: [{ model: db.Permission, as: 'permission', attributes: ['idPermission', 'permissionName', 'permissionKey'] }]
            }
        ]
    });
    res.status(200).json(rolePrivileges);
  } catch (error) {
    console.error(`${LOG_PREFIX_RP_CONTROLLER} getAllRolePrivileges - Error:`, error);
    res.status(500).json({ message: "Error al obtener todas las asignaciones de rol-privilegio.", error: error.message });
  }
};

// GET /api/roleprivileges/:idRolePrivilege
const getRolePrivilegeById = async (req, res) => {
  const { idRolePrivilege } = req.params;
  console.log(`${LOG_PREFIX_RP_CONTROLLER} getRolePrivilegeById - Solicitado para ID: ${idRolePrivilege}`);
  const errors = validationResult(req); // Asumiendo que tienes una validación para el ID
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const rolePrivilege = await RolePrivilege.findByPk(idRolePrivilege, {
        include: [
            { model: Role, as: 'role', attributes: ['idRole', 'roleName'] },
            { model: Privilege, as: 'privilege', attributes: ['idPrivilege', 'privilegeName', 'privilegeKey'] }
        ]
    });
    if (!rolePrivilege) {
      return res.status(404).json({ message: 'Asignación rol-privilegio no encontrada.' });
    }
    res.status(200).json(rolePrivilege);
  } catch (error) {
    console.error(`${LOG_PREFIX_RP_CONTROLLER} getRolePrivilegeById - Error para ID ${idRolePrivilege}:`, error);
    res.status(500).json({ message: "Error al obtener la asignación rol-privilegio.", error: error.message });
  }
};

// POST /api/roleprivileges (Crea UNA entrada)
// Body: { idRole, idPrivilege }
const createRolePrivilege = async (req, res) => {
  console.log(`${LOG_PREFIX_RP_CONTROLLER} createRolePrivilege - Solicitado. Body:`, JSON.stringify(req.body, null, 2));
  const errors = validationResult(req); // Validación para idRole, idPrivilege, y unicidad
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { idRole, idPrivilege } = req.body; // Solo estos dos campos son necesarios
  try {
    // La validación (que te ayudaré a crear luego) debe verificar:
    // 1. Que idRole existe en la tabla Roles.
    // 2. Que idPrivilege existe en la tabla Privileges.
    // 3. Que la combinación (idRole, idPrivilege) no exista ya en RolePrivileges.

    const newRolePrivilege = await RolePrivilege.create({ idRole, idPrivilege });
    res.status(201).json(newRolePrivilege);
  } catch (error) {
    console.error(`${LOG_PREFIX_RP_CONTROLLER} createRolePrivilege - Error:`, error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: "Esta combinación de rol y privilegio ya existe.", details: error.errors });
    }
    // Errores de FK (si un idRole o idPrivilege no existe) también pueden ocurrir
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: "El rol o privilegio especificado no existe.", field: error.fields });
    }
    res.status(500).json({ message: "Error al crear la asignación rol-privilegio.", error: error.message });
  }
};

// PUT /api/roleprivileges/:idRolePrivilege
// Body: { idRole, idPrivilege } (si se permite cambiar la asignación)
const updateRolePrivilege = async (req, res) => {
  const { idRolePrivilege } = req.params;
  console.log(`${LOG_PREFIX_RP_CONTROLLER} updateRolePrivilege - Solicitado para ID: ${idRolePrivilege}. Body:`, JSON.stringify(req.body, null, 2));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { idRole, idPrivilege } = req.body; // Campos que se pueden actualizar

  // Validar que no se pueda actualizar a una combinación existente (idRole, idPrivilege)
  // que no sea la actual entrada que se está modificando.
  // Esta validación es un poco más compleja.

  try {
    const [updatedCount] = await RolePrivilege.update({ idRole, idPrivilege }, {
      where: { idPrivilegedRole: idRolePrivilege }
    });

    if (updatedCount > 0) {
      const updatedRolePrivilege = await RolePrivilege.findByPk(idRolePrivilege);
      res.status(200).json(updatedRolePrivilege);
    } else {
      res.status(404).json({ message: 'Asignación rol-privilegio no encontrada para actualizar.' });
    }
  } catch (error) {
    console.error(`${LOG_PREFIX_RP_CONTROLLER} updateRolePrivilege - Error para ID ${idRolePrivilege}:`, error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: "Esta combinación de rol y privilegio ya está en uso por otra asignación.", details: error.errors });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: "El nuevo rol o privilegio especificado no existe.", field: error.fields });
    }
    res.status(500).json({ message: "Error al actualizar la asignación rol-privilegio.", error: error.message });
  }
};

// DELETE /api/roleprivileges/:idRolePrivilege
const deleteRolePrivilege = async (req, res) => {
  // ... (sin cambios importantes aquí, parece correcto)
  const { idRolePrivilege } = req.params;
  console.log(`${LOG_PREFIX_RP_CONTROLLER} deleteRolePrivilege - Solicitado para ID: ${idRolePrivilege}`);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const deletedCount = await RolePrivilege.destroy({
      where: { idPrivilegedRole: idRolePrivilege }
    });
    if (deletedCount > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Asignación rol-privilegio no encontrada para eliminar.' });
    }
  } catch (error) {
    console.error(`${LOG_PREFIX_RP_CONTROLLER} deleteRolePrivilege - Error para ID ${idRolePrivilege}:`, error);
    res.status(500).json({ message: "Error al eliminar la asignación rol-privilegio.", error: error.message });
  }
};


module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
};