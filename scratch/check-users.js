require("./load-env");
const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log("Fetching users from database...");
  const res = await client.query("SELECT id, name, email, password_hash as \"passwordHash\", role, is_active as \"isActive\" FROM users");
  console.log("Users in Database:");
  console.log(res.rows);

  await client.end();
}

main().catch(err => {
  console.error("Failed:", err);
});
