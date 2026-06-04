import { pgTable, text, timestamp, boolean, uuid, pgEnum, integer, doublePrecision } from "drizzle-orm/pg-core";

// Define the role enum
export const userRoleEnum = pgEnum("user_role", ["admin", "cashier", "kitchen", "staff"]);

// 1. Tenants Table (Global context)
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(), // e.g., 'gatto-bar-01'
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  primaryColor: text("primary_color").default("#f59e0b").notNull(),
  logoUrl: text("logo_url"),
  displayName: text("display_name"),
});

// 2. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("staff").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Tenant Modules Table
export const tenantModules = pgTable("tenant_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  moduleName: text("module_name").notNull(),
  isCustomized: boolean("is_customized").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Categories Table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Stock Items Table (Inventory)
export const stockItems = pgTable("stock_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: doublePrecision("quantity").default(0).notNull(),
  unit: text("unit").default("units").notNull(), // 'Liters', 'Kilos', 'Units'
  minStock: doublePrecision("min_stock").default(0).notNull(),
  price: integer("price").default(0).notNull(), // Price in cents
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Kegs Table (Beer Tap Management)
export const kegs = pgTable("kegs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. 'IPA', 'Honey', 'Stout'
  status: text("status").default("stored").notNull(), // 'stored', 'tapped', 'empty', 'returned'
  tapNumber: integer("tap_number"), // Assigned tap number (1-16)
  capacity: doublePrecision("capacity").default(50).notNull(), // in liters
  currentVolume: doublePrecision("current_volume").default(50).notNull(), // in liters
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Reservations Table
export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  pax: integer("pax").default(2).notNull(),
  tableNumber: text("table_number").notNull(),
  reservationDate: timestamp("reservation_date").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'confirmed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Sales / Caja Table
export const sales = pgTable("sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in cents
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Prebatches Table (Internal mixes tracking)
export const prebatches = pgTable("prebatches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(), // e.g. 'Negroni Mix', 'House Sour Mix'
  productionDate: timestamp("production_date").defaultNow().notNull(),
  expirationDate: timestamp("expiration_date"),
  initialQuantityMl: doublePrecision("initial_quantity_ml").notNull(),
  currentQuantityMl: doublePrecision("current_quantity_ml").notNull(),
  batchId: text("batch_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Work Schedules Table
export const workSchedules = pgTable("work_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workDate: timestamp("work_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  notes: text("notes"),
});

// 11. Bar Configurations Table
export const barConfigs = pgTable("bar_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openingTime: text("opening_time").notNull(),
  kitchenCloseTime: text("kitchen_close_time").notNull(),
  barCloseTime: text("bar_close_time").notNull(),
  allowStaffStockAdjust: boolean("allow_staff_stock_adjust").default(false).notNull(),
  allowCashierKegManage: boolean("allow_cashier_keg_manage").default(false).notNull(),
  allowKitchenViewSales: boolean("allow_kitchen_view_sales").default(false).notNull(),
});

// 12. Expenses Table
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in cents
  category: text("category").notNull(),
  description: text("description").notNull(),
  invoiceNumber: text("invoice_number"),
  supplierName: text("supplier_name"),
  status: text("status").notNull(), // 'Paid', 'Pending', etc.
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// 13. Stock Movements Table
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  stockItemId: uuid("stock_item_id")
    .notNull()
    .references(() => stockItems.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'in', 'out', 'adjustment'
  quantity: doublePrecision("quantity").notNull(),
  reason: text("reason").notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

