// update_password.js
// Run with: node update_password.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetmanagement';

async function updatePassword() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const loginId = 'empp02';
    const newPassword = 'Nitheesh@2';
    const hashed = bcrypt.hashSync(newPassword, 10);
    const result = await User.findOneAndUpdate({ login_id: loginId }, { password: hashed }, { new: true });
    if (result) {
      console.log(`Password for ${loginId} updated successfully.`);
    } else {
      console.log(`User ${loginId} not found.`);
    }
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    mongoose.disconnect();
  }
}

updatePassword();
