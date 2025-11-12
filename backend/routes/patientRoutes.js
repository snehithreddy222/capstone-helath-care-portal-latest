const express = require('express');
const router = express.Router();
const {
  createPatient,
  getMe,              // ✅
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ✅ current user's patient profile
router.get('/me', getMe);

// Create patient profile
router.post('/', createPatient);

// Get all patients (doctors and admins only)
router.get('/', authorize('DOCTOR', 'ADMIN'), getAllPatients);

// Get patient by ID
router.get('/:id', getPatientById);

// Update patient
router.put('/:id', updatePatient);

// Delete patient (admins only)
router.delete('/:id', authorize('ADMIN'), deletePatient);

module.exports = router;
