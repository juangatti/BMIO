"use server";

import { db } from "../index";
import { reservations } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addReservation(data: {
  tenantId: string;
  customerName: string;
  pax: number;
  tableNumber: string;
  reservationDate: Date;
  notes?: string;
}) {
  try {
    await db.insert(reservations).values({
      tenantId: data.tenantId,
      customerName: data.customerName,
      pax: data.pax,
      tableNumber: data.tableNumber,
      reservationDate: data.reservationDate,
      notes: data.notes || "",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add reservation:", error);
    return { success: false, error: error.message };
  }
}

export async function updateReservationStatus(resId: string, status: "pending" | "confirmed" | "cancelled") {
  try {
    await db.update(reservations)
      .set({ status })
      .where(eq(reservations.id, resId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update reservation status:", error);
    return { success: false, error: error.message };
  }
}
