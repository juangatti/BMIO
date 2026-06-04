const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.qktssnxozvtivewgwgeh:dvAomq9d9w26LIQ4@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log("Seeding prebatches data for tenant: gatto-bar-01...");

  // Get categories to find categoryId for Beers/Spirits
  const catRes = await client.query("SELECT id, name FROM categories WHERE tenant_id = 'gatto-bar-01'");
  const categoryMap = {};
  catRes.rows.forEach(row => {
    categoryMap[row.name] = row.id;
  });

  const spiritsId = categoryMap['Spirits'] || null;

  // Clear existing prebatches
  await client.query("DELETE FROM prebatches WHERE tenant_id = 'gatto-bar-01'");

  // Insert Prebatches
  await client.query(`
    INSERT INTO prebatches (id, tenant_id, category_id, name, production_date, expiration_date, initial_quantity_ml, current_quantity_ml, batch_id, is_active, created_at)
    VALUES
      (gen_random_uuid(), 'gatto-bar-01', ${spiritsId ? `'${spiritsId}'` : 'NULL'}, 'Negroni Pre-Mix 10L', NOW() - interval '3 days', NOW() + interval '10 days', 10000, 7500, 'NEG-042', true, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', ${spiritsId ? `'${spiritsId}'` : 'NULL'}, 'House Sour Mix 5L', NOW() - interval '1 days', NOW() + interval '3 days', 5000, 4800, 'SOUR-109', true, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', ${spiritsId ? `'${spiritsId}'` : 'NULL'}, 'Exotic Passion Fruit Syrup 2L', NOW() - interval '15 days', NOW() - interval '1 days', 2000, 500, 'EXO-001', true, NOW()), -- EXPIRED
      (gen_random_uuid(), 'gatto-bar-01', ${spiritsId ? `'${spiritsId}'` : 'NULL'}, 'Mauer Old Fashioned Blend 4L', NOW() - interval '5 days', NOW() + interval '1 day', 4000, 1200, 'OLD-332', true, NOW())   -- WARNING (expires tomorrow)
  `);

  console.log("Prebatches successfully seeded!");
  await client.end();
}

main().catch(err => {
  console.error("Seeding prebatches failed:", err);
  process.exit(1);
});
