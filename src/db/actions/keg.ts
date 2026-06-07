"use server";

import { db } from "../index";
import { kegs, stockItems, categories, stockMovements } from "../schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function pourBeer(kegId: string, amountLiters: number) {
  try {
    const [keg] = await db.select().from(kegs).where(eq(kegs.id, kegId)).limit(1);
    if (!keg) throw new Error("Keg not found");

    const newVolume = Math.max(0, keg.currentVolume - amountLiters);
    const newStatus = newVolume === 0 ? "empty" : keg.status;

    await db.update(kegs)
      .set({
        currentVolume: newVolume,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(kegs.id, kegId));

    // Find or create corresponding stock item for this keg name
    let stockItemId: string | null = null;
    const [stockItem] = await db.select().from(stockItems).where(
      and(
        eq(stockItems.tenantId, keg.tenantId),
        eq(stockItems.name, keg.name)
      )
    ).limit(1);

    if (stockItem) {
      stockItemId = stockItem.id;
    } else {
      const [category] = await db.select().from(categories).where(eq(categories.tenantId, keg.tenantId)).limit(1);
      let catId = category?.id;
      if (!catId) {
        const [newCat] = await db.insert(categories).values({
          tenantId: keg.tenantId,
          name: "Beer"
        }).returning();
        catId = newCat.id;
      }
      const [newItem] = await db.insert(stockItems).values({
        tenantId: keg.tenantId,
        categoryId: catId,
        name: keg.name,
        quantity: keg.currentVolume,
        unit: "Liters",
        minStock: 10,
        price: 500,
      }).returning();
      stockItemId = newItem.id;
    }

    if (stockItemId) {
      await db.insert(stockMovements).values({
        tenantId: keg.tenantId,
        stockItemId: stockItemId,
        type: "out",
        quantity: amountLiters,
        reason: `Pour beer: ${keg.name} on Tap ${keg.tapNumber || "N/A"}`,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to pour beer:", error);
    return { success: false, error: error.message };
  }
}

export async function updateKegStatus(kegId: string, status: "stored" | "tapped" | "empty" | "returned", tapNumber: number | null = null) {
  try {
    // If tapping, clear previous tap if it was occupied
    if (status === "tapped" && tapNumber !== null) {
      // Clear any other tapped keg on this same tap number
      const [keg] = await db.select().from(kegs).where(eq(kegs.id, kegId)).limit(1);
      if (keg) {
        await db.update(kegs)
          .set({ tapNumber: null, status: "stored" })
          .where(
            and(
              eq(kegs.tenantId, keg.tenantId),
              eq(kegs.tapNumber, tapNumber)
            )
          );
      }
    }

    await db.update(kegs)
      .set({
        status,
        tapNumber: status === "tapped" ? tapNumber : null,
        updatedAt: new Date(),
      })
      .where(eq(kegs.id, kegId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update keg status:", error);
    return { success: false, error: error.message };
  }
}

export async function addKeg(data: {
  tenantId: string;
  name: string;
  capacity: number;
  currentVolume: number;
}) {
  try {
    await db.insert(kegs).values({
      tenantId: data.tenantId,
      name: data.name,
      capacity: data.capacity,
      currentVolume: data.currentVolume,
      status: "stored"
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add keg:", error);
    return { success: false, error: error.message };
  }
}
