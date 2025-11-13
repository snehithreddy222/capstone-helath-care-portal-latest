// backend/routes/billingRoutes.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const ctrl = require("../controllers/billingController");

const router = express.Router();

router.use(authenticateToken);

// list and balance
router.get("/invoices", ctrl.listInvoices);
router.get("/balance", ctrl.balance);
router.get("/invoices/:id/receipt", ctrl.receipt);

// checkout
router.post("/checkout", ctrl.checkout);

module.exports = router;
