"use server";

import { db } from "../index";
import { expenses } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addExpense(
  tenantId: string,
  userId: string,
  data: {
    amount: number;
    category: string;
    description: string;
    invoiceNumber?: string;
    supplierName?: string;
    status: string;
    dueDate?: string;
  }
) {
  try {
    await db.insert(expenses).values({
      tenantId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      invoiceNumber: data.invoiceNumber || null,
      supplierName: data.supplierName || null,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add expense:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    await db.delete(expenses).where(eq(expenses.id, expenseId));
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: error.message };
  }
}

export async function getExpenses(tenantId: string) {
  try {
    const data = await db.select().from(expenses).where(eq(expenses.tenantId, tenantId));
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to get expenses:", error);
    return { success: false, error: error.message };
  }
}
