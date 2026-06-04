require("./load-env");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { drizzle } = require("drizzle-orm/node-postgres");
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

async function main() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();
  const db = drizzle(client);

  console.log("Running migrations from ./src/db/migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations successfully completed!");
  await client.end();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
