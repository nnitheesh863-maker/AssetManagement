const pool = require("./db");

async function main() {
	const res = await pool.query("SELECT 1 AS connected");
	console.log("Database connected:", res.rows[0].connected === 1 || res.rows[0].connected === '1');
}

main()
	.catch((error) => {
		console.error("Database connection failed:", error.message);
		process.exitCode = 1;
	})
	.finally(() => pool.end());