// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public
router.post('/register', register);
router.post('/login', login);

// Protected
router.get('/profile', authenticateToken, getProfile);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
