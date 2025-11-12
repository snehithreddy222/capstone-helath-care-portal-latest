// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare Portal API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      patients: {
        me: 'GET /api/patients/me',
        create: 'POST /api/patients',
        getAll: 'GET /api/patients',
        getById: 'GET /api/patients/:id',
        update: 'PUT /api/patients/:id',
        delete: 'DELETE /api/patients/:id'
      },
      doctors: {
        listSimple: 'GET /api/doctors',
        listPaginated: 'GET /api/doctors/paginated',
        getById: 'GET /api/doctors/:id',
        create: 'POST /api/doctors',
        update: 'PUT /api/doctors/:id',
        delete: 'DELETE /api/doctors/:id'
      },
      appointments: {
        mine: 'GET /api/appointments/mine',
        create: 'POST /api/appointments',
        getAll: 'GET /api/appointments',
        getById: 'GET /api/appointments/:id',
        update: 'PUT /api/appointments/:id',
        cancel: 'PATCH /api/appointments/:id/cancel',
        delete: 'DELETE /api/appointments/:id'
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

// Start
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🏥 Healthcare Portal API Server');
  console.log('=================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/`);
  console.log('=================================');
  console.log('Available Endpoints:');
  console.log('  Auth: /api/auth');
  console.log('  Patients: /api/patients');
  console.log('  Doctors: /api/doctors');
  console.log('  Appointments: /api/appointments');
  console.log('=================================');
});

module.exports = app;
