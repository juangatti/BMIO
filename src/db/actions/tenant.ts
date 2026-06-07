"use server";

import { db } from "../index";
import { tenants, barConfigs } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTenantBranding(tenantId: string, data: { primaryColor: string; logoUrl: string | null; displayName: string | null; tapCount: number }) {
  try {
    await db.update(tenants)
      .set({
        primaryColor: data.primaryColor,
        logoUrl: data.logoUrl,
        displayName: data.displayName,
        tapCount: data.tapCount,
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update tenant branding:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRolePermissions(configId: string, data: { allowStaffStockAdjust: boolean; allowCashierKegManage: boolean; allowKitchenViewSales: boolean }) {
  try {
    const [config] = await db.select().from(barConfigs).where(eq(barConfigs.id, configId)).limit(1);
    if (config) {
      await db.update(barConfigs)
        .set({
          allowStaffStockAdjust: data.allowStaffStockAdjust,
          allowCashierKegManage: data.allowCashierKegManage,
          allowKitchenViewSales: data.allowKitchenViewSales,
         })
        .where(eq(barConfigs.tenantId, config.tenantId));
    } else {
      await db.update(barConfigs)
        .set({
          allowStaffStockAdjust: data.allowStaffStockAdjust,
          allowCashierKegManage: data.allowCashierKegManage,
          allowKitchenViewSales: data.allowKitchenViewSales,
        })
        .where(eq(barConfigs.id, configId));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update role permissions:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBarConfig(
  configId: string,
  data: {
    openingTime: string;
    kitchenCloseTime: string;
    barCloseTime: string;
  }
) {
  try {
    await db.update(barConfigs)
      .set({
        openingTime: data.openingTime,
        kitchenCloseTime: data.kitchenCloseTime,
        barCloseTime: data.barCloseTime,
      })
      .where(eq(barConfigs.id, configId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update bar configuration:", error);
    return { success: false, error: error.message };
  }
}
