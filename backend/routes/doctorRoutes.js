// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const {
  listDoctors,
  createDoctor,
  getDoctorById,
  getAllDoctors,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Public doctor endpoints
 * - Simple list for dropdowns: GET /api/doctors
 * - Paginated/search listing:  GET /api/doctors/paginated
 * - Single doctor by id:      GET /api/doctors/:id
 */
router.get('/', listDoctors);
router.get('/paginated', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.use(authenticateToken);

// Create doctor profile (admins only)
router.post('/', authorize('ADMIN'), createDoctor);

// Update doctor
router.put('/:id', updateDoctor);

// Delete doctor (admins only)
router.delete('/:id', authorize('ADMIN'), deleteDoctor);

module.exports = router;
