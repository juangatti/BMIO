const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.qktssnxozvtivewgwgeh:dvAomq9d9w26LIQ4@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

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
