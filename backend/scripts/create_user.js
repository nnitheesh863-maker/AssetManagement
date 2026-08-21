require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assetflow');
    const { User } = require('../models'); // assuming script is in backend/scripts
    const loginId = 'empp02';
    const existing = await User.findOne({ login_id: loginId });
    if (existing) {
      console.log('User already exists:', existing.login_id);
      process.exit(0);
    }
    const password = 'Nitheesh@2';
    const hashed = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      login_id: loginId,
      name: 'Nithesh',
      email: 'empp02@example.com',
      role: 'ADMIN', // or appropriate role
      status: 'ACTIVE',
      password: hashed,
    });
    console.log('Created user:', newUser.login_id);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
})();
