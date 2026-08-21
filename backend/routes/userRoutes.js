const express = require('express');
const router = express.Router();
const { User } = require('../models');

// --- Users Management Routes ---
router.get("/users", async (req, res) => {
  try {
    const data = await User.find().sort({ created_at: -1 }).select("-password");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { loginId, name, email, role, position, address, mobile, password, photo } = req.body;
    await User.create({
      login_id: loginId, name, email, role, position, address, mobile, password, photo: photo || ""
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/users/:loginId", async (req, res) => {
  try {
    const { loginId } = req.params;
    const { name, email, role, position, address, mobile, password, photo } = req.body;
    
    let updateData = { name, email, role, position, address, mobile, photo: photo || "" };
    if (password) {
      updateData.password = password;
    }
    
    await User.findOneAndUpdate({ login_id: loginId }, updateData);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:loginId", async (req, res) => {
  try {
    const { loginId } = req.params;
    await User.findOneAndDelete({ login_id: loginId });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Authentication Route ---
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ login_id: loginId, password });
    
    if (user) {
      const userObj = user.toObject();
      delete userObj.password; // Don't send password back to client
      res.json({ success: true, user: userObj });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
