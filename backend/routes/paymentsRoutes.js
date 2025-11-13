const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/paymentsController');

// All require auth
router.use(authenticateToken);

// List current patient's invoices
router.get('/invoices/mine', controller.listMyInvoices);

// Get single invoice by id (must belong to patient)
router.get('/invoices/:id', controller.getInvoice);

// Create a checkout session for an invoice
router.post('/checkout-session', controller.createCheckoutSession);

module.exports = router;
