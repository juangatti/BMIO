"use server";

import { db } from "../index";
import { categories } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addCategory(tenantId: string, name: string) {
  try {
    await db.insert(categories).values({
      tenantId,
      name,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message };
  }
}
