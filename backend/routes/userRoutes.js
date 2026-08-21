const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken, requirePermission, JWT_SECRET } = require('../middleware/auth');

// --- Users Management Routes ---
router.get("/users", authenticateToken, requirePermission("users.view"), async (req, res) => {
  try {
    const data = await User.find().sort({ created_at: -1 }).select("-password");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", authenticateToken, requirePermission("users.create"), async (req, res) => {
  try {
    const { loginId, name, email, role, position, address, mobile, password, photo } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await User.create({
      login_id: loginId, 
      name, 
      email, 
      role: role || "PENDING", 
      position, 
      address, 
      mobile, 
      password: hashedPassword, 
      photo: photo || "",
      status: (role && role !== "PENDING") ? "ACTIVE" : "PENDING"
    });
    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/users/:loginId", authenticateToken, async (req, res) => {
  try {
    const { loginId } = req.params;
    
    // Self-edit is allowed, otherwise user must have users.edit permission
    const isSelf = req.user.login_id === loginId;
    const hasAdminEdit = req.user.role === 'ADMIN' || req.user.role === 'System Administrator';
    
    if (!isSelf && !hasAdminEdit) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit this user." });
    }

    const { name, email, role, position, address, mobile, password, photo, status, permissions } = req.body;
    
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (photo !== undefined) updateData.photo = photo || "";
    if (password !== undefined) updateData.password = bcrypt.hashSync(password, 10);

    // Role-related settings require admin edit rights
    if (hasAdminEdit) {
      if (role !== undefined) updateData.role = role;
      if (position !== undefined) updateData.position = position;
      if (status !== undefined) updateData.status = status;
      if (permissions !== undefined) updateData.permissions = permissions;
    }
    
    await User.findOneAndUpdate({ login_id: loginId }, updateData);
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/users/:loginId", authenticateToken, requirePermission("users.edit"), async (req, res) => {
  try {
    const { loginId } = req.params;
    await User.findOneAndDelete({ login_id: loginId });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Registration (Public Endpoint) ---
router.post("/register", async (req, res) => {
  try {
    const { loginId, email, password, name, mobile, address } = req.body;
    const existing = await User.findOne({ login_id: loginId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Login ID already taken" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.create({
      login_id: loginId,
      email,
      password: hashedPassword,
      name: name || loginId,
      mobile: mobile || "",
      address: address || "",
      role: "PENDING",
      status: "PENDING"
    });
    res.status(201).json({ success: true, message: "Registration successful! Awaiting Admin activation." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Authentication Route ---
router.post("/login", async (req, res) => {
   console.log('Request body:', req.body);
   const { loginId, password } = req.body;
  try {
    const user = await User.findOne({ login_id: loginId });
    if (!user) {
      console.log('User not found for loginId:', loginId);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    if (user) {
      console.log('Received password:', password);
    const isMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match result:', isMatch);
      if (isMatch) {
        if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
          return res.status(403).json({ success: false, message: `Access Denied: Account status is ${user.status}` });
        }

        const userObj = user.toObject();
        delete userObj.password;
        
        const token = jwt.sign(
          { loginId: user.login_id, role: user.role, status: user.status }, 
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({ success: true, token, user: userObj });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
