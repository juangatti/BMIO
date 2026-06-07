"use server";

import { db } from "../index";
import { workSchedules } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addSchedule(data: {
  tenantId: string;
  userId: string;
  workDate: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  try {
    await db.insert(workSchedules).values({
      tenantId: data.tenantId,
      userId: data.userId,
      workDate: data.workDate,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || "",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add work schedule:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    await db.delete(workSchedules).where(eq(workSchedules.id, scheduleId));
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete work schedule:", error);
    return { success: false, error: error.message };
  }
}
