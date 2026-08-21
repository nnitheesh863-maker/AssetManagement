const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Users Management Routes ---
router.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT login_id, name, email, role, position, address, mobile, photo, created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { loginId, name, email, role, position, address, mobile, password, photo } = req.body;
    await pool.query(
      `INSERT INTO users (login_id, name, email, role, position, address, mobile, password, photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [loginId, name, email, role, position, address, mobile, password, photo || ""]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/users/:loginId", async (req, res) => {
  try {
    const { loginId } = req.params;
    const { name, email, role, position, address, mobile, password, photo } = req.body;
    
    if (password) {
      await pool.query(
        `UPDATE users SET name = $1, email = $2, role = $3, position = $4, address = $5, mobile = $6, password = $7, photo = $8 WHERE login_id = $9`,
        [name, email, role, position, address, mobile, password, photo || "", loginId]
      );
    } else {
      await pool.query(
        `UPDATE users SET name = $1, email = $2, role = $3, position = $4, address = $5, mobile = $6, photo = $7 WHERE login_id = $8`,
        [name, email, role, position, address, mobile, photo || "", loginId]
      );
    }
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:loginId", async (req, res) => {
  try {
    const { loginId } = req.params;
    await pool.query("DELETE FROM users WHERE login_id = $1", [loginId]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Authentication Route ---
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE login_id = $1 AND password = $2", [loginId, password]);
    
    if (rows.length > 0) {
      const user = rows[0];
      delete user.password; // Don't send password back to client
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
