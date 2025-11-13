const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const ctrl = require("../controllers/prescriptionController");

const router = express.Router();

router.use(authenticateToken);

// GET /api/medications
router.get("/", ctrl.list);

module.exports = router;
