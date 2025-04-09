const express = require('express');
const { logout, login } = require('../controllers/authController');

const router = express.Router();


router.post('/login', login);
router.post('/logout', logout);


module.exports = router;
