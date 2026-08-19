require("dotenv").config();
const pool = require("./db");

const queryText = process.argv.slice(2).join(" ");

if (!queryText) {
  console.log("\nAssetFlow DB Query Tool");
  console.log("------------------------");
  console.log("Usage: node query.js \"YOUR SQL QUERY\"");
  console.log("Example: node query.js \"SELECT * FROM sales_orders\"\n");
  process.exit(0);
}

async function run() {
  try {
    const res = await pool.query(queryText);
    if (res.rows.length === 0) {
      console.log("Query returned 0 rows.");
    } else {
      console.table(res.rows);
    }
  } catch (err) {
    console.error("SQL Error:", err.message);
  } finally {
    await pool.end();
  }
}
run();
