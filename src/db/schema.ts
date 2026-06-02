import { pgTable, text, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";

// 1. Tenants Table (Global context)
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(), // e.g., 'gatto-bar-01'
  name: text("name").notNull(),
  plan: text("plan").default("free").notNull(), // 'free', 'pro', 'enterprise'
  status: text("status").default("active").notNull(), // 'active', 'suspended'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Helper for tenant column - references the global tenants table
const tenantIdColumn = () => text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" });

// 2. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("staff").notNull(), // 'admin', 'manager', 'staff'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Menu Items Table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Tables / Zones Table
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  number: text("number").notNull(),
  capacity: integer("capacity").default(4).notNull(),
  status: text("status").default("empty").notNull(), // 'empty', 'occupied', 'reserved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  tableId: integer("table_id").references(() => tables.id, { onDelete: "restrict" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(), // 'pending', 'preparing', 'served', 'paid', 'cancelled'
  totalAmount: integer("total_amount").default(0).notNull(), // Sum in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  tenantId: tenantIdColumn(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // Historical snapshot price in cents
  notes: text("notes"),
});
