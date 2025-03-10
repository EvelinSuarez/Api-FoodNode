



const express = require("express")
const router = express.Router()
const rolePrivilegesController = require("../controllers/rolePrivilegesController")
const {
  getRolePrivilegeByIdValidation,
  createRolePrivilegeValidation,
  updateRolePrivilegeValidation,
  deleteRolePrivilegeValidation,
} = require("../middlewares/rolePrivilegesValidations")

router.get("/", rolePrivilegesController.getAllRolePrivileges)
router.get("/:idRolePrivilege", getRolePrivilegeByIdValidation, rolePrivilegesController.getRolePrivilegeById)
router.post("/", createRolePrivilegeValidation, rolePrivilegesController.createRolePrivilege)
router.put("/:idRolePrivilege", updateRolePrivilegeValidation, rolePrivilegesController.updateRolePrivilege)
router.delete("/:idRolePrivilege", deleteRolePrivilegeValidation, rolePrivilegesController.deleteRolePrivilege)

// Nueva ruta para asignar múltiples privilegios a un rol
router.post("/assignToRole/:idRole", rolePrivilegesController.assignPrivilegesToRole)

module.exports = router



