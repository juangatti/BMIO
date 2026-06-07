"use server";

import { db } from "../index";
import { prebatches } from "../schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addPrebatch(data: {
  tenantId: string;
  categoryId: string | null;
  name: string;
  productionDate: Date;
  expirationDate: Date | null;
  initialQuantityMl: number;
  batchId?: string;
}) {
  try {
    await db.insert(prebatches).values({
      tenantId: data.tenantId,
      categoryId: data.categoryId,
      name: data.name,
      productionDate: data.productionDate,
      expirationDate: data.expirationDate,
      initialQuantityMl: data.initialQuantityMl,
      currentQuantityMl: data.initialQuantityMl, // starts at initial
      batchId: data.batchId || "",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add prebatch:", error);
    return { success: false, error: error.message };
  }
}

export async function consumePrebatch(prebatchId: string, amountMl: number) {
  try {
    const [pb] = await db.select().from(prebatches).where(eq(prebatches.id, prebatchId)).limit(1);
    if (!pb) throw new Error("Prebatch not found");

    const newQty = Math.max(0, pb.currentQuantityMl - amountMl);

    await db.update(prebatches)
      .set({ currentQuantityMl: newQty })
      .where(eq(prebatches.id, prebatchId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to consume prebatch:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePrebatch(prebatchId: string) {
  try {
    await db.update(prebatches)
      .set({ isActive: false })
      .where(eq(prebatches.id, prebatchId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete prebatch:", error);
    return { success: false, error: error.message };
  }
}
