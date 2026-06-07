# Bar Manager IO (BMIO)

**Bar Manager IO (BMIO)** is a premium, multi-tenant B2B white-label operational control panel designed for gastronomy businesses and craft bars. Built with Next.js, React 19, and Supabase PostgreSQL with Drizzle ORM, it enables managers to run daily operations, control beer taps, audit stock movements, handle table reservations, prebatch preparation lists, and balance financials.

---

## Key Features & Architecture

### 1. Dynamic White-Label Engine
*   **Organization-Aware Logins**: Workers sign in using the format `name@organization` (e.g. `carlos@gatto-bar-01`).
*   **Real-Time Branding Customization**: Tenant settings instantly update UI colors using CSS variables (e.g. `--color-primary`), application logos, and display names without rebuilds.

### 2. Operational Control Panel
*   **Overview Dashboard**: Real-time stats widgets displaying registered stock warnings, active beer taps, today's sales cashflow, and system notifications.
*   **Beer Tap Console**: Dynamic tap grid (1–8) featuring fluid volumetric indicators, manual tap registration, empty/return transitions, and transactional serving logging.
*   **Menu & Inventory Manager**: Automated ingredient tracking using real-time minimum stock alert calculations.
*   **Stock Movement Auditing**: Auto-generated transaction ledger logging manual quantity adjustments and tap pours with user timestamps and reasons.
*   **Table Reservations Ledger**: Booking list to schedule customers, track guest counts, assign tables, and switch statuses.
*   **Prebatch Prep Module**: Controls drink batching and mixes with expiration alerts and remaining volume tracking.
*   **Worker Schedules**: View and coordinate weekly shifts and work sessions.
*   **Role-Based Access Control (RBAC)**: Custom settings to restrict cashiers, staff, or kitchen roles from stock adjustments, keg management, or sales visibility.

### 3. Financial Analytics & Invoices (Bento Grid)
*   **Asset Valuation**: Computes inventory worth dynamically (`quantity * cost`).
*   **Revenue vs Expenses**: Interactive SVG charts rendering a 7-day performance area chart (complete with responsive point hover tooltips).
*   **Category Spend Breakdown**: Dynamic SVG donut chart visualizing operational costs by category.
*   **Expense Manager**: Bill ledger with search filtering, status indicators (`Paid` / `Pending`), and manual invoice logging.

---

## Codebase Architecture (Atomic Design & Modular Server Actions)

The codebase is organized following **Atomic Design** principles for frontend React components and **Domain-Driven Modules** for backend database server actions:

### 1. Frontend Component Structure (`src/components/`)
*   **Atoms** (`src/components/atoms/`): Context-free, styling-only primitive controls (e.g. `Button`, `Input`, `Select`, `Textarea`, `LedIndicator`).
*   **Molecules** (`src/components/molecules/`): Basic UI aggregates combining atoms (e.g. `TabButton`, `Breadcrumb`, `StatusBadge`).
*   **Organisms** (`src/components/organisms/`): Highly contextual widgets and layouts (e.g. `Sidebar`, `Topbar`, `StockTable`, `MovementsTable`, `SVGCharts`, `BulkImportModal`, `IngredientDetailCard`).
    *   *Tabs* (`src/components/organisms/tabs/`): Domain controllers rendering views for each specific workspace tab (`OverviewTab`, `TapsTab`, `InventoryTab`, `FinancialsTab`, etc.).
*   **Templates** (`src/components/templates/`): Page layout layouts wrapping the viewport (`DashboardShell`).
*   **Coordinator** (`src/components/Dashboard.tsx`): Main client page container orchestrating active tabs, state transitions, client-side events, and database actions.

### 2. Modular Server Actions (`src/db/actions/`)
All backend operations are separated into domain actions to maintain clean files, split by responsibilities:
*   🔑 `auth.ts`: Handles user profiles, logins, and permission roles.
*   🏬 `tenant.ts`: Manages multi-tenant configurations, tap counts, and RBAC flags.
*   📦 `stock.ts`: Manages inventory adjustments and spreadsheet imports.
*   🛢️ `keg.ts`: Beer tap pours and barrel replacements.
*   📅 `reservation.ts`: Table reservation schedules.
*   💸 `expense.ts`: Log sheets for invoices and bills.
*   🏺 `prebatch.ts`: Pre-mixes shelf-life and volume tracking.
*   ⏰ `schedule.ts`: Staff shifts planning.
*   💰 `sales.ts`: Sales register transaction entries.
*   🏷️ `category.ts`: Spend/product categories.
*   📊 `dashboard.ts`: High-performance aggregated metrics loader.

To preserve backward compatibility, `src/db/actions.ts` acts as the single entry point, explicitly re-exporting all functions. Core cryptographic hashing functions are kept in a separate standard module `src/db/auth-utils.ts` to prevent Next.js Turbopack server-action compilation issues.

---

## Technology Stack

*   **Framework**: Next.js (App Router, Server Actions)
*   **Library**: React 19 (React Transitions, hooks)
*   **Styles**: Tailwind CSS v4 & Vanilla CSS Variables (dynamic colors)
*   **Database**: Supabase PostgreSQL
*   **ORM**: Drizzle ORM
*   **Icons**: Lucide React

---

## Database Schema Model

The PostgreSQL schema (`src/db/schema.ts`) consists of 13 main entities:
*   `tenants`: Configuration details (primary color, logo URL, custom name).
*   `users`: Active accounts, roles (`admin`, `cashier`, `kitchen`, `staff`).
*   `bar_configs`: Tenant options, shift times, and granular permission flags.
*   `categories`: Menu and stock grouping.
*   `stock_items`: Trackable inventory units.
*   `stock_movements`: Immutable log of stock changes.
*   `kegs`: Beer barrels and assignments (Tap 1-8).
*   `reservations`: Table bookings.
*   `sales`: Register of sales transactions.
*   `expenses`: Operational invoices and utilities.
*   `prebatches`: Volumes and shelf-lives for internal pre-mixes.
*   `work_schedules`: Work calendars.
*   `tenant_modules`: Modular activations.

---

## Setup & Running Locally

### 1. Prerequisites
Ensure you have Node.js (v22+) installed on your machine.

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]?sslmode=require
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migrations
Drizzle migration commands fail under PgBouncer SSL connection pooling. Run the custom programmatic runner:
```bash
# Generate migrations
npx drizzle-kit generate

# Run migrations programmatically
node scratch/run-migrations.js
```

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
