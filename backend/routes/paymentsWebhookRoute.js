// backend/routes/paymentsWebhookRoute.js
const express = require("express");
const ctrl = require("../controllers/billingController");

// This router expects to receive raw body already applied in server.js
const router = express.Router();
router.post("/webhook", ctrl.webhook);

module.exports = router;
