// backend/routes/fileRoutes.js
const express = require("express");
const router = express.Router();
const { sasUrl } = require("../utils/azureBlob");
const { authenticateToken } = require("../middleware/auth");

router.use(authenticateToken);

/**
 * GET /api/files/sas
 * Query:
 *   key         required
 *   filename    optional
 *   mode        "redirect" (default) | "url"
 *   disposition "attachment" (default) | "inline"
 */
router.get("/sas", (req, res) => {
  const key = String(req.query.key || "").trim();
  const filename = String(req.query.filename || "document.pdf").trim();
  const mode = String(req.query.mode || "redirect").toLowerCase();
  const disposition =
    String(req.query.disposition || "attachment").toLowerCase() === "inline"
      ? "inline"
      : "attachment";

  if (!key) {
    return res.status(400).json({ success: false, message: "key is required" });
  }

  try {
    const url = sasUrl(key, filename, disposition);

    if (mode === "url") {
      return res.json({ success: true, url });
    }
    return res.redirect(url);
  } catch (err) {
    console.error("files.sas error", err);
    return res.status(500).json({ success: false, message: "Failed to build SAS URL" });
  }
});

module.exports = router;
