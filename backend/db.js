require("dotenv/config");

const mysql = require("mysql2/promise");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in backend/.env");
}

const databaseUrl = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1),
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;