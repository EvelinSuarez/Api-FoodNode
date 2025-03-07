const { validationResult } = require("express-validator")
const rolePrivilegesService = require("../services/rolePrivilegesService")

const getAllRolePrivileges = async (req, res) => {
  try {
    const rolePrivileges = await rolePrivilegesService.getAllRolePrivileges()
    res.status(200).json(rolePrivileges)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getRolePrivilegeById = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const rolePrivilege = await rolePrivilegesService.getRolePrivilegeById(req.params.idRolePrivilege)
    res.status(200).json(rolePrivilege)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const createRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const rolePrivilege = await rolePrivilegesService.createRolePrivilege(req.body)
    res.status(201).json(rolePrivilege)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    await rolePrivilegesService.updateRolePrivilege(req.params.idRolePrivilege, req.body)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteRolePrivilege = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    await rolePrivilegesService.deleteRolePrivilege(req.params.idRolePrivilege)
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getAllRolePrivileges,
  getRolePrivilegeById,
  createRolePrivilege,
  updateRolePrivilege,
  deleteRolePrivilege,
}

