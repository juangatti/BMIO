require("./load-env");
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
  connectionString: connectionString,
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
