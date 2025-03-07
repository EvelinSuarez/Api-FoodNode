/* const express = require("express")
const router = express.Router()
const rolePrivilegesController = require("../controllers/rolePrivilegesController")

router.get("/", rolePrivilegesController.getAllRolePrivileges)
router.get("/:idRolePrivilege", rolePrivilegesController.getRolePrivilegeById)
router.post("/", rolePrivilegesController.createRolePrivilege)
router.put("/:idRolePrivilege", rolePrivilegesController.updateRolePrivilege)
router.delete("/:idRolePrivilege", rolePrivilegesController.deleteRolePrivilege)

module.exports = router */

const express = require("express")
const router = express.Router()
const rolePrivilegesController = require("../controllers/rolePrivilegesController")
const {
  getRolePrivilegeByIdValidation,
  createRolePrivilegeValidation,
  updateRolePrivilegeValidation,
  deleteRolePrivilegeValidation,
} = require("../middlewares/rolePrivilegesValidations")

router.get("/:idRolePrivilege", getRolePrivilegeByIdValidation, rolePrivilegesController.getRolePrivilegeById)
router.post("/", createRolePrivilegeValidation, rolePrivilegesController.createRolePrivilege)
router.put("/:idRolePrivilege", updateRolePrivilegeValidation, rolePrivilegesController.updateRolePrivilege)
router.delete("/:idRolePrivilege", deleteRolePrivilegeValidation, rolePrivilegesController.deleteRolePrivilege)

module.exports = router

