const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Audit Logs Routes ---
router.get("/audit-logs", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM audit_logs ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/audit-logs", async (req, res) => {
  try {
    const { datetime, user, module, type, record_id, action, field, old_val, new_val } = req.body;
    await pool.query(
      `INSERT INTO audit_logs (datetime, "user", module, type, record_id, action, field, old_val, new_val) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [datetime, user, module, type, record_id, action, field || "", old_val || "", new_val || ""]
    );
    res.status(201).json({ message: "Audit log created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/audit-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM audit_logs WHERE id = $1", [id]);
    res.json({ message: "Audit log deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
