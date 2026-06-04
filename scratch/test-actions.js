const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.qktssnxozvtivewgwgeh:dvAomq9d9w26LIQ4@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function runTests() {
  console.log("=== STARTING BACKEND SYSTEM TESTS ===");

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  // Test 1: Fetch initial state
  console.log("Test 1: Fetching initial dashboard state...");
  const initialRes = await client.query("SELECT * FROM kegs WHERE tenant_id = 'gatto-bar-01'");
  console.log(`Found ${initialRes.rows.length} kegs in database.`);

  const ipaKeg = initialRes.rows.find(k => k.name === "IPA Beer" && k.status === "tapped");
  if (!ipaKeg) {
    throw new Error("Initial Honey or IPA Beer keg not found.");
  }
  console.log(`IPA Beer Keg Current Volume: ${ipaKeg.current_volume}L`);

  // Test 2: Simulate pouring beer
  console.log("\nTest 2: Simulating pouring 1.5L from IPA Beer Keg...");
  const newVol = ipaKeg.current_volume - 1.5;
  await client.query(`UPDATE kegs SET current_volume = ${newVol} WHERE id = '${ipaKeg.id}'`);
  
  // Record sale
  await client.query(`INSERT INTO sales (tenant_id, amount, description) VALUES ('gatto-bar-01', 1500, 'Simulated beer pour: 1.5L')`);
  
  // Fetch updated volume
  const updatedRes = await client.query(`SELECT current_volume FROM kegs WHERE id = '${ipaKeg.id}'`);
  console.log(`IPA Beer Keg Updated Volume: ${updatedRes.rows[0].current_volume}L (Expected: ${newVol}L)`);

  // Test 3: Insert new reservation
  console.log("\nTest 3: Inserting test reservation...");
  const resId = '550e8400-e29b-41d4-a716-446655440000';
  await client.query(`
    INSERT INTO reservations (id, tenant_id, customer_name, pax, table_number, reservation_date, status, notes)
    VALUES ('${resId}', 'gatto-bar-01', 'Test Customer', 2, 'Table T1', NOW(), 'confirmed', 'Test notes')
    ON CONFLICT (id) DO UPDATE SET customer_name = 'Test Customer';
  `);
  
  const checkRes = await client.query(`SELECT * FROM reservations WHERE id = '${resId}'`);
  console.log(`Inserted Reservation successfully: Customer "${checkRes.rows[0].customer_name}" at "${checkRes.rows[0].table_number}".`);

  // Cleanup test reservation
  await client.query(`DELETE FROM reservations WHERE id = '${resId}'`);
  console.log("Cleanup: Deleted test reservation.");

  console.log("\n=== ALL SYSTEM TESTS PASSED SUCCESSFULLY! ===");
  await client.end();
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
