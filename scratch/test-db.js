require("./load-env");
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
// Remove sslmode query parameter to prevent pg from overriding our manual SSL config
const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, "");

console.log("Connecting to:", cleanConnectionString.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
  connectionString: cleanConnectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO DATABASE!");
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log("Result:", res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error("DATABASE CONNECTION ERROR:", err);
    process.exit(1);
  });
