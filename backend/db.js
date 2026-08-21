require("dotenv").config();
const mongoose = require("mongoose");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in backend/.env");
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;