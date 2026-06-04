require("./load-env");
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
  console.log("Connected to database. Starting seeding for Schedules and Bar Configurations...");

  const tenantId = "gatto-bar-01";

  // 1. Ensure we have the tenant first
  await client.query(`
    INSERT INTO tenants (id, name, is_active, created_at)
    VALUES ('${tenantId}', 'El Gatto Negro Bar', true, NOW())
    ON CONFLICT (id) DO UPDATE SET name = 'El Gatto Negro Bar';
  `);

  // 2. Clear existing schedules and bar configs to start fresh
  await client.query(`DELETE FROM work_schedules WHERE tenant_id = '${tenantId}'`);
  await client.query(`DELETE FROM bar_configs WHERE tenant_id = '${tenantId}'`);

  // 3. Ensure we have some users in the tenant
  console.log("Ensuring users exist in tenant...");
  await client.query(`
    INSERT INTO users (id, tenant_id, name, email, password_hash, role, is_active)
    VALUES 
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '${tenantId}', 'Juan Admin', 'admin@gattobar.com', 'hashed_password', 'admin', true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '${tenantId}', 'Sofia Bartender', 'sofia@gattobar.com', 'hashed_password', 'staff', true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '${tenantId}', 'Mateo Cashier', 'mateo@gattobar.com', 'hashed_password', 'cashier', true),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '${tenantId}', 'Chef Marcos', 'marcos@gattobar.com', 'hashed_password', 'kitchen', true)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
  `);

  // Fetch the users
  const usersRes = await client.query(`SELECT id, name, role FROM users WHERE tenant_id = '${tenantId}'`);
  console.log(`Found/created ${usersRes.rows.length} users.`);

  // 4. Seed barConfigs (0-6 days)
  console.log("Seeding bar configurations (0-6)...");
  for (let day = 0; day <= 6; day++) {
    // Weekends (Friday: 5, Saturday: 6) might open later/longer
    const isOpenLate = (day === 5 || day === 6);
    await client.query(`
      INSERT INTO bar_configs (id, tenant_id, day_of_week, opening_time, kitchen_close_time, bar_close_time)
      VALUES (
        gen_random_uuid(),
        '${tenantId}',
        ${day},
        '18:00',
        '${isOpenLate ? "02:00" : "01:00"}',
        '${isOpenLate ? "03:00" : "02:00"}'
      )
    `);
  }

  // 5. Seed some sample schedules
  console.log("Seeding work schedules...");
  const adminUser = usersRes.rows.find(u => u.role === "admin");
  const staffUser = usersRes.rows.find(u => u.role === "staff");
  const cashierUser = usersRes.rows.find(u => u.role === "cashier");
  const kitchenUser = usersRes.rows.find(u => u.role === "kitchen");

  const today = new Date();
  
  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  const scheduleData = [
    {
      userId: adminUser.id,
      dateOffset: 0, // Today
      startTime: "17:30",
      endTime: "02:00",
      notes: "Opening supervisor shift"
    },
    {
      userId: staffUser.id,
      dateOffset: 0, // Today
      startTime: "18:00",
      endTime: "02:00",
      notes: "Main bar counter"
    },
    {
      userId: kitchenUser.id,
      dateOffset: 0, // Today
      startTime: "17:00",
      endTime: "01:30",
      notes: "Kitchen prep & dinner rush"
    },
    {
      userId: cashierUser.id,
      dateOffset: 0, // Today
      startTime: "19:00",
      endTime: "02:30",
      notes: "Caja / Closing checkout"
    },
    {
      userId: staffUser.id,
      dateOffset: 1, // Tomorrow
      startTime: "18:00",
      endTime: "02:00",
      notes: "Weekend extra shift"
    },
    {
      userId: kitchenUser.id,
      dateOffset: 1, // Tomorrow
      startTime: "18:00",
      endTime: "02:00",
      notes: "Weekend main kitchen"
    }
  ];

  for (const s of scheduleData) {
    const workDate = new Date();
    workDate.setDate(today.getDate() + s.dateOffset);
    workDate.setHours(12, 0, 0, 0); // Keep time normalized

    await client.query(`
      INSERT INTO work_schedules (id, tenant_id, user_id, work_date, start_time, end_time, notes)
      VALUES (
        gen_random_uuid(),
        '${tenantId}',
        '${s.userId}',
        '${workDate.toISOString()}',
        '${s.startTime}',
        '${s.endTime}',
        '${s.notes}'
      )
    `);
  }

  console.log("Schedules and bar configs seeding successfully completed!");
  await client.end();
}

main().catch(err => {
  console.error("Seeding schedules failed:", err);
  process.exit(1);
});
