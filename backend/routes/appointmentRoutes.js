const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,   // <-- NEW
  getAppointmentById,
  getAllAppointments,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Create
router.post('/', createAppointment);

// List mine (patient from JWT)
router.get('/mine', getMyAppointments);   // <-- NEW

// List all (with filters: status, patientId, doctorId, date)
router.get('/', getAllAppointments);

// Get by id
router.get('/:id', getAppointmentById);

// Update
router.put('/:id', updateAppointment);

// Cancel
router.patch('/:id/cancel', cancelAppointment);

// Delete (admins only)
router.delete('/:id', authorize('ADMIN'), deleteAppointment);

module.exports = router;
