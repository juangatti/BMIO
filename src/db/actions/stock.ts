"use server";

import { db } from "../index";
import { stockItems, stockMovements, categories, stockAudits, stockAuditItems } from "../schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addStockItem(data: {
  tenantId: string;
  categoryId: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
}) {
  try {
    await db.insert(stockItems).values({
      tenantId: data.tenantId,
      categoryId: data.categoryId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      minStock: data.minStock,
      price: data.price,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add stock item:", error);
    return { success: false, error: error.message };
  }
}

export async function adjustStockItemQuantity(itemId: string, newQuantity: number, userId?: string) {
  try {
    const [item] = await db.select().from(stockItems).where(eq(stockItems.id, itemId)).limit(1);
    if (!item) throw new Error("Stock item not found");

    const diff = newQuantity - item.quantity;

    await db.update(stockItems)
      .set({ quantity: newQuantity })
      .where(eq(stockItems.id, itemId));

    await db.insert(stockMovements).values({
      tenantId: item.tenantId,
      stockItemId: itemId,
      type: "adjustment",
      quantity: diff,
      reason: `Manual adjustment from ${item.quantity} to ${newQuantity}`,
      userId: userId || null,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to adjust stock:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkImportStock(
  tenantId: string,
  userId: string,
  items: Array<{
    name: string;
    categoryName: string;
    quantity: number;
    unit: string;
    price: number; // in cents
    minStock: number;
  }>
) {
  try {
    // 1. Get all categories for this tenant
    const existingCategories = await db.select().from(categories).where(eq(categories.tenantId, tenantId));
    
    // 2. Get all existing stock items for this tenant
    const existingStock = await db.select().from(stockItems).where(eq(stockItems.tenantId, tenantId));
    
    // 3. Process each item
    for (const item of items) {
      let categoryId = "";
      const matchedCategory = existingCategories.find(c => c.name.toLowerCase() === item.categoryName.toLowerCase());
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      } else {
        // Create new category dynamically
        const [newCat] = await db.insert(categories).values({
          tenantId,
          name: item.categoryName,
        }).returning({ id: categories.id });
        
        categoryId = newCat.id;
        existingCategories.push({ id: categoryId, tenantId, name: item.categoryName, createdAt: new Date() });
      }
      
      const matchedItem = existingStock.find(si => si.name.toLowerCase() === item.name.toLowerCase());
      if (matchedItem) {
        // Update existing item
        const diff = item.quantity - matchedItem.quantity;
        
        await db.update(stockItems)
          .set({
            categoryId,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            minStock: item.minStock,
          })
          .where(eq(stockItems.id, matchedItem.id));
          
        if (diff !== 0) {
          await db.insert(stockMovements).values({
            tenantId,
            stockItemId: matchedItem.id,
            type: "adjustment",
            quantity: diff,
            reason: `Spreadsheet bulk import update (from ${matchedItem.quantity} to ${item.quantity})`,
            userId,
          });
        }
      } else {
        // Create new stock item
        const [newItem] = await db.insert(stockItems).values({
          tenantId,
          categoryId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          minStock: item.minStock,
          price: item.price,
          isActive: true,
        }).returning({ id: stockItems.id });
        
        await db.insert(stockMovements).values({
          tenantId,
          stockItemId: newItem.id,
          type: "in",
          quantity: item.quantity,
          reason: "Spreadsheet bulk import creation",
          userId,
        });
      }
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to bulk import stock:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStockItem(
  itemId: string,
  data: {
    name: string;
    categoryId: string;
    quantity: number;
    unit: string;
    price: number; // in cents
    minStock: number;
  },
  userId?: string
) {
  try {
    const [existing] = await db.select().from(stockItems).where(eq(stockItems.id, itemId)).limit(1);
    if (!existing) {
      return { success: false, error: "Stock item not found" };
    }

    const diff = data.quantity - existing.quantity;

    await db.update(stockItems)
      .set({
        name: data.name,
        categoryId: data.categoryId,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        minStock: data.minStock,
      })
      .where(eq(stockItems.id, itemId));

    if (diff !== 0) {
      await db.insert(stockMovements).values({
        tenantId: existing.tenantId,
        stockItemId: itemId,
        type: diff > 0 ? "in" : "out",
        quantity: Math.abs(diff),
        reason: `Profile manual update (from ${existing.quantity} to ${data.quantity})`,
        userId: userId || null,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update stock item:", error);
    return { success: false, error: error.message };
  }
}

export async function startStockAudit(tenantId: string, userId?: string) {
  try {
    // 1. Create audit record
    const [audit] = await db.insert(stockAudits).values({
      tenantId,
      userId: userId || null,
      status: "in_progress",
    }).returning({ id: stockAudits.id });

    // 2. Snapshot current stock
    const currentStock = await db.select().from(stockItems).where(eq(stockItems.tenantId, tenantId));
    
    if (currentStock.length > 0) {
      const auditItems = currentStock.map(item => ({
        auditId: audit.id,
        stockItemId: item.id,
        expectedQuantity: item.quantity,
        countedQuantity: null,
      }));
      await db.insert(stockAuditItems).values(auditItems);
    }

    revalidatePath("/");
    return { success: true, auditId: audit.id };
  } catch (error: any) {
    console.error("Failed to start stock audit:", error);
    return { success: false, error: error.message };
  }
}

export async function saveAuditProgress(auditId: string, items: Array<{ stockItemId: string, countedQuantity: number }>) {
  try {
    for (const item of items) {
      await db.update(stockAuditItems)
        .set({ countedQuantity: item.countedQuantity })
        .where(and(
          eq(stockAuditItems.auditId, auditId),
          eq(stockAuditItems.stockItemId, item.stockItemId)
        ));
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save audit progress:", error);
    return { success: false, error: error.message };
  }
}

export async function cancelStockAudit(auditId: string) {
  try {
    await db.update(stockAudits)
      .set({ status: "cancelled", completedAt: new Date() })
      .where(eq(stockAudits.id, auditId));
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to cancel stock audit:", error);
    return { success: false, error: error.message };
  }
}

export async function finalizeStockAudit(auditId: string, userId?: string) {
  try {
    const audit = await db.select().from(stockAudits).where(eq(stockAudits.id, auditId)).limit(1);
    if (!audit || audit.length === 0) throw new Error("Audit not found");
    if (audit[0].status !== "in_progress") throw new Error("Audit is not in progress");

    const items = await db.select().from(stockAuditItems).where(eq(stockAuditItems.auditId, auditId));

    for (const item of items) {
      if (item.countedQuantity !== null && item.countedQuantity !== item.expectedQuantity) {
        const variance = item.countedQuantity - item.expectedQuantity;

        // 1. Get real-time quantity
        const [realTimeItem] = await db.select().from(stockItems).where(eq(stockItems.id, item.stockItemId)).limit(1);
        if (realTimeItem) {
          const newRealTimeQuantity = realTimeItem.quantity + variance;
          
          // 2. Apply variance to real-time quantity
          await db.update(stockItems)
            .set({ quantity: newRealTimeQuantity })
            .where(eq(stockItems.id, item.stockItemId));

          // 3. Log movement
          await db.insert(stockMovements).values({
            tenantId: audit[0].tenantId,
            stockItemId: item.stockItemId,
            type: "adjustment",
            quantity: variance, // can be negative or positive depending on variance
            reason: `Stock Audit Reconciliation (Variance: ${variance > 0 ? '+' : ''}${variance})`,
            userId: userId || null,
          });
        }
      }
    }

    await db.update(stockAudits)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(stockAudits.id, auditId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to finalize stock audit:", error);
    return { success: false, error: error.message };
  }
}

