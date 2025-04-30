// controllers/rolePrivilegesController.js (CORREGIDO - SIN DUPLICADOS)

const { validationResult } = require("express-validator");
// const rolePrivilegesService = require("../services/rolePrivilegesService"); // Comentado si no se usa directamente
const RolePrivilege = require("../models/rolePrivileges"); // Importa el MODELO directamente
const Role = require("../models/role");
const Privilege = require("../models/privilege");
const Permission = require("../models/permission");

// --- Función para ASIGNAR privilegios (SOLO UNA VEZ) ---
const assignPrivilegesToRole = async (req, res) => {
  try {
    const { idRole } = req.params;
    const assignments = req.body; // Asume array [{ idPermission, idPrivilege }]

    if (!Array.isArray(assignments)) {
       return res.status(400).json({ message: "El cuerpo de la solicitud debe ser un array de asignaciones." });
    }
    const roleIdInt = parseInt(idRole, 10);
     if (isNaN(roleIdInt)) {
         return res.status(400).json({ message: "ID de rol inválido." });
     }
    const role = await Role.findByPk(roleIdInt);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const transaction = await RolePrivilege.sequelize.transaction();
    try {
        console.log(`[Controller] Eliminando asignaciones existentes para Role ID: ${roleIdInt}`);
        await RolePrivilege.destroy({ where: { idRole: roleIdInt }, transaction });

        const newAssignments = assignments.map(item => ({
            idRole: roleIdInt,
            idPermission: item.idPermission,
            idPrivilege: item.idPrivilege
        }));

        const validAssignments = [];
        for (const item of newAssignments) {
            if (typeof item.idPermission !== 'number' || typeof item.idPrivilege !== 'number') {
                console.warn(`[Controller] Asignación inválida omitida (IDs no numéricos):`, item);
                continue;
            }
            validAssignments.push(item);
        }

        let createdRolePrivileges = [];
        if (validAssignments.length > 0) {
             console.log(`[Controller] Creando ${validAssignments.length} nuevas asignaciones para Role ID: ${roleIdInt}`);
             createdRolePrivileges = await RolePrivilege.bulkCreate(validAssignments, { transaction });
        } else {
             console.log(`[Controller] No hay asignaciones válidas para crear para Role ID: ${roleIdInt}`);
        }

        await transaction.commit();
        console.log(`[Controller] Asignaciones actualizadas exitosamente para Role ID: ${roleIdInt}`);
        res.status(200).json({
          message: "Privilegios y permisos asignados/actualizados con éxito",
          rolePrivileges: createdRolePrivileges
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error durante la transacción de asignación:", error);
        res.status(500).json({ message: "Error interno al actualizar asignaciones." });
    }

  } catch (error) {
    console.error("Error general al asignar privilegios:", error);
    res.status(400).json({ message: error.message || "Error inesperado al procesar la solicitud." });
  }
};

// --- Función para OBTENER asignaciones de un rol ---
const getRoleAssignments = async (req, res) => {
  try {
      const roleId = req.params.id;
      console.log(`[Controller] Solicitud GET /role/${roleId}/privileges (getRoleAssignments) recibida.`);
      const roleIdInt = parseInt(roleId, 10);
      if (isNaN(roleIdInt)) {
          console.warn(`[Controller] ID de rol inválido recibido: ${roleId}`);
          return res.status(400).json({ message: "ID de rol inválido." });
      }

      const assignments = await RolePrivilege.findAll({
          where: { idRole: roleIdInt },
          attributes: ['idPrivilegedRole', 'idRole', 'idPermission', 'idPrivilege']
      });
      console.log(`[Controller] Asignaciones encontradas para Rol ID ${roleIdInt}: ${assignments.length} encontradas.`);
      res.status(200).json(assignments);

  } catch (error) {
      console.error(`❌ [Controller] Error en getRoleAssignments para rol ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error al obtener las asignaciones del rol' });
  }
};


// --- Otras funciones CRUD (Mantenlas si las usas en tus rutas) ---

const getAllRolePrivileges = async (req, res) => {
  try {
    // Asume que rolePrivilegesService existe y funciona o reemplaza con lógica directa si es necesario
    const rolePrivileges = await RolePrivilege.findAll(); // Ejemplo directo
    res.status(200).json(rolePrivileges);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRolePrivilegeById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Asume que rolePrivilegesService existe y funciona o reemplaza con lógica directa si es necesario
    const rolePrivilege = await RolePrivilege.findByPk(req.params.idRolePrivilege); // Ejemplo directo
    if (!rolePrivilege) {
        return res.status(404).json({ message: 'Asignación no encontrada'});
    }
    res.status(200).json(rolePrivilege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createRolePrivilege = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Asume que rolePrivilegesService existe y funciona o reemplaza con lógica directa si es necesario
    const rolePrivilege = await RolePrivilege.create(req.body); // Ejemplo directo
    res.status(201).json(rolePrivilege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRolePrivilege = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Asume que rolePrivilegesService existe y funciona o reemplaza con lógica directa si es necesario
    const [updated] = await RolePrivilege.update(req.body, { where: { idPrivilegedRole: req.params.idRolePrivilege } }); // Ejemplo directo
    if (updated) {
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Asignación no encontrada para actualizar'});
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRolePrivilege = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Asume que rolePrivilegesService existe y funciona o reemplaza con lógica directa si es necesario
    const deleted = await RolePrivilege.destroy({ where: { idPrivilegedRole: req.params.idRolePrivilege } }); // Ejemplo directo
     if (deleted) {
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Asignación no encontrada para eliminar'});
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Exporta las funciones necesarias (SIN DUPLICADOS) ---
module.exports = {
  getAllRolePrivileges,     // Si la usas
  getRolePrivilegeById,     // Si la usas
  createRolePrivilege,    // Si la usas
  updateRolePrivilege,    // Si la usas
  deleteRolePrivilege,    // Si la usas
  assignPrivilegesToRole, // La función de asignar (una sola vez)
  getRoleAssignments,     // La nueva función para obtener asignaciones
};