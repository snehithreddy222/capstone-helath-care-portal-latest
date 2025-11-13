// backend/routes/testResultRoutes.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const controller = require("../controllers/testResultsController");

const router = express.Router();
router.use(authenticateToken);

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.get("/:id/download", controller.download);

module.exports = router;
