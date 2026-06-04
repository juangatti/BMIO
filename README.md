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
