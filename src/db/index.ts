// Disable TLS unauthorized rejection globally for the database connection (resolves self-signed cert chain errors)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/bar_manager";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
