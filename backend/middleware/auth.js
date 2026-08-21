const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ROLE_PERMISSIONS } = require('../utils/permissions');

const JWT_SECRET = process.env.JWT_SECRET || 'shiv_furniture_super_secret_key_2026';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch actual user from MongoDB to check status and load fresh permissions/roles
    const user = await User.findOne({ login_id: decoded.loginId });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
      return res.status(403).json({ success: false, message: `Your account is currently ${user.status}. Please contact an Administrator.` });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Admin override
    if (req.user.role === 'ADMIN' || req.user.role === 'System Administrator') {
      return next();
    }

    const role = req.user.role || 'PENDING';
    const roleAllowedPerms = ROLE_PERMISSIONS[role] || [];
    const customUserPerms = req.user.permissions || [];

    const hasPermission = roleAllowedPerms.includes(permission) || customUserPerms.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: `You do not have permission: ${permission}` });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePermission,
  JWT_SECRET
};
