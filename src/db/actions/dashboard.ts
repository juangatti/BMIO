"use server";

import { db } from "../index";
import { tenants, categories, stockItems, kegs, reservations, sales, prebatches, workSchedules, barConfigs, users, expenses, stockMovements, stockAudits, stockAuditItems } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getDashboardData(tenantId: string) {
  try {
    const [tenantData] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenantData) {
      throw new Error(`Tenant '${tenantId}' not found.`);
    }

    const categoriesData = await db.select().from(categories).where(eq(categories.tenantId, tenantId));
    const stockItemsData = await db.select().from(stockItems).where(eq(stockItems.tenantId, tenantId));
    const kegsData = await db.select().from(kegs).where(eq(kegs.tenantId, tenantId));
    const reservationsData = await db.select().from(reservations).where(eq(reservations.tenantId, tenantId));
    const salesData = await db.select().from(sales).where(eq(sales.tenantId, tenantId));
    const prebatchesData = await db.select().from(prebatches).where(
      and(
        eq(prebatches.tenantId, tenantId),
        eq(prebatches.isActive, true)
      )
    );
    const schedulesData = await db.select().from(workSchedules).where(eq(workSchedules.tenantId, tenantId));
    const barConfigsData = await db.select().from(barConfigs).where(eq(barConfigs.tenantId, tenantId));
    const usersData = await db.select().from(users).where(
      and(
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      )
    );
    const expensesData = await db.select().from(expenses).where(eq(expenses.tenantId, tenantId));
    const stockMovementsData = await db.select().from(stockMovements).where(eq(stockMovements.tenantId, tenantId));
    const stockAuditsData = await db.select().from(stockAudits).where(eq(stockAudits.tenantId, tenantId));
    // Get items for in-progress audits (we could filter by status, but pulling all is fine for small MVP, or join)
    const activeAudits = stockAuditsData.filter(a => a.status === "in_progress").map(a => a.id);
    let stockAuditItemsData: any[] = [];
    if (activeAudits.length > 0) {
      stockAuditItemsData = await db.select().from(stockAuditItems); // Simple approach
    }

    return {
      success: true,
      data: {
        tenant: tenantData,
        categories: categoriesData,
        stockItems: stockItemsData,
        kegs: kegsData,
        reservations: reservationsData,
        sales: salesData,
        prebatches: prebatchesData,
        schedules: schedulesData,
        barConfigs: barConfigsData,
        users: usersData,
        expenses: expensesData,
        stockMovements: stockMovementsData,
        stockAudits: stockAuditsData,
        stockAuditItems: stockAuditItemsData,
      }
    };
  } catch (error: any) {
    console.error("Failed to load dashboard data:", error);
    return { success: false, error: error.message || "Failed to load data" };
  }
}
