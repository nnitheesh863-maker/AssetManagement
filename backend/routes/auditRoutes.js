const express = require('express');
const router = express.Router();
const { AuditLog } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// --- Audit Logs Routes ---
router.get("/audit-logs", authenticateToken, requirePermission("audit.view"), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ _id: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/audit-logs", authenticateToken, async (req, res) => {
  try {
    const { datetime, user, module, type, record_id, action, field, old_val, new_val } = req.body;
    await AuditLog.create({
      datetime, 
      user, 
      module, 
      type, 
      record_id, 
      action, 
      field: field || "", 
      old_val: old_val || "", 
      new_val: new_val || ""
    });
    res.status(201).json({ success: true, message: "Audit log created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/audit-logs/:id", authenticateToken, requirePermission("users.assign_role"), async (req, res) => {
  try {
    const { id } = req.params;
    await AuditLog.findByIdAndDelete(id);
    res.json({ success: true, message: "Audit log deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
