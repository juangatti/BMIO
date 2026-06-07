"use server";

import { db } from "../index";
import { sales } from "../schema";
import { revalidatePath } from "next/cache";

export async function addSale(tenantId: string, amount: number, description: string) {
  try {
    await db.insert(sales).values({
      tenantId,
      amount,
      description,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to record sale:", error);
    return { success: false, error: error.message };
  }
}
