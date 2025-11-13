// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Core routers
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const testResultRoutes = require('./routes/testResultRoutes');
const fileRoutes = require('./routes/fileRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Payments
// 1) Webhook must receive RAW body (Stripe signature verification)
// 2) JSON routes for normal API
const paymentsJsonRoutes = require('./routes/paymentsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS first
app.use(cors());

// Stripe webhook MUST be mounted BEFORE express.json()
// Use express.raw only for this specific endpoint.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/paymentsWebhookRoute')
);

// Normal body parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API routers
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/medications', prescriptionRoutes);
app.use('/api/files', fileRoutes);

// Payments JSON routes (create checkout session, list invoices, receipts, etc.)
app.use('/api/payments', paymentsJsonRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// 500 handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
