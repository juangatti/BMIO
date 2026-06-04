require("./load-env");
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

  console.log("Seeding initial data for tenant: gatto-bar-01...");

  // 1. Insert Tenant
  await client.query(`
    INSERT INTO tenants (id, name, is_active, created_at)
    VALUES ('gatto-bar-01', 'El Gatto Negro Bar', true, NOW())
    ON CONFLICT (id) DO UPDATE SET name = 'El Gatto Negro Bar';
  `);

  // 2. Insert Categories and get their IDs
  const catRes = await client.query(`
    INSERT INTO categories (id, tenant_id, name, created_at)
    VALUES 
      (gen_random_uuid(), 'gatto-bar-01', 'Beers', NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Spirits', NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Food', NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Soft Drinks', NOW())
    RETURNING id, name;
  `);

  const categoryMap = {};
  catRes.rows.forEach(row => {
    categoryMap[row.name] = row.id;
  });

  console.log("Categories seeded:", Object.keys(categoryMap));

  // 3. Clear existing stock, kegs, reservations and sales to have a clean start
  await client.query("DELETE FROM stock_items WHERE tenant_id = 'gatto-bar-01'");
  await client.query("DELETE FROM kegs WHERE tenant_id = 'gatto-bar-01'");
  await client.query("DELETE FROM reservations WHERE tenant_id = 'gatto-bar-01'");
  await client.query("DELETE FROM sales WHERE tenant_id = 'gatto-bar-01'");

  // 4. Insert Stock Items
  await client.query(`
    INSERT INTO stock_items (id, tenant_id, category_id, name, quantity, unit, min_stock, price, is_active, created_at)
    VALUES
      (gen_random_uuid(), 'gatto-bar-01', '${categoryMap['Beers']}', 'Honey Beer Keg 50L', 2, 'units', 1, 15000, true, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', '${categoryMap['Beers']}', 'IPA Beer Keg 50L', 3, 'units', 1, 18000, true, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', '${categoryMap['Spirits']}', 'Gin Beefeater 750ml', 12, 'bottles', 5, 2500, true, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', '${categoryMap['Soft Drinks']}', 'Tonic Water 350ml', 24, 'cans', 48, 80, true, NOW()), -- triggering min_stock alert
      (gen_random_uuid(), 'gatto-bar-01', '${categoryMap['Food']}', 'French Fries portion', 100, 'units', 20, 450, true, NOW());
  `);

  // 5. Insert Kegs
  await client.query(`
    INSERT INTO kegs (id, tenant_id, name, status, tap_number, capacity, current_volume, updated_at)
    VALUES
      (gen_random_uuid(), 'gatto-bar-01', 'Honey Beer', 'tapped', 1, 50, 32.5, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'IPA Beer', 'tapped', 2, 50, 12.0, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Irish Stout', 'stored', NULL, 50, 50.0, NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Pilsner Lager', 'empty', NULL, 50, 0.0, NOW());
  `);

  // 6. Insert Reservations
  await client.query(`
    INSERT INTO reservations (id, tenant_id, customer_name, pax, table_number, reservation_date, status, notes, created_at)
    VALUES
      (gen_random_uuid(), 'gatto-bar-01', 'Carlos Gardel', 4, 'Table 14', NOW() + interval '2 hours', 'confirmed', 'Prefers window seat', NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Aníbal Troilo', 2, 'Table 5', NOW() + interval '4 hours', 'pending', 'Gluten-free table', NOW()),
      (gen_random_uuid(), 'gatto-bar-01', 'Astor Piazzolla', 6, 'Table 20', NOW() + interval '26 hours', 'confirmed', 'Celebrating birthday', NOW());
  `);

  // 7. Insert Sales
  await client.query(`
    INSERT INTO sales (id, tenant_id, amount, description, created_at)
    VALUES
      (gen_random_uuid(), 'gatto-bar-01', 45000, 'Daily ticket #1024', NOW() - interval '3 hours'),
      (gen_random_uuid(), 'gatto-bar-01', 32000, 'Daily ticket #1025', NOW() - interval '2 hours'),
      (gen_random_uuid(), 'gatto-bar-01', 18500, 'Daily ticket #1026', NOW() - interval '1 hours');
  `);

  console.log("Seeding successfully completed!");
  await client.end();
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
