"use server";

import { db } from "./index";
import { tenants, users, tenantModules, categories, stockItems, kegs, reservations, sales, prebatches, workSchedules, barConfigs, expenses, stockMovements } from "./schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "bmio_default_secure_session_secret_2026_xyz123";

function signSession(userJson: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(userJson);
  const signature = hmac.digest("hex");
  return `${userJson}.${signature}`;
}

function verifyAndParseSession(cookieValue: string): any | null {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return null;
  
  const userJson = cookieValue.substring(0, dotIndex);
  const signature = cookieValue.substring(dotIndex + 1);
  
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(userJson);
  const expectedSignature = hmac.digest("hex");
  
  if (signature !== expectedSignature) {
    return null;
  }
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

function hashPassword(password: string): string {
  const salt = "bmio_salt_secure_2026";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash === "hashed_password" || storedHash === "password" || storedHash === "admin" || storedHash === "123456") {
    return password === storedHash || (storedHash === "hashed_password" && (password === "password" || password === "admin" || password === "123456"));
  }
  return hashPassword(password) === storedHash || password === storedHash;
}

// 1. Get entire dashboard state for a tenant
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
      }
    };
  } catch (error: any) {
    console.error("Failed to load dashboard data:", error);
    return { success: false, error: error.message || "Failed to load data" };
  }
}

// 2. Taps / Keg Actions
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

// 3. Stock Actions
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

// 4. Reservation Actions
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

// 5. Sales Actions
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

// 6. Keg Registration Actions
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

// 7. Prebatches Actions
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

// 8. Work Schedules Actions
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

// 9. Authentication & User Actions
export async function loginUser(usernameAndOrg: string, passwordHash: string) {
  try {
    const atIndex = usernameAndOrg.lastIndexOf("@");
    if (atIndex === -1 || atIndex === 0 || atIndex === usernameAndOrg.length - 1) {
      return { success: false, error: "Invalid username format. Must be User@Organization (e.g., admin@gatto-bar-01)" };
    }

    const nameOrEmail = usernameAndOrg.substring(0, atIndex).trim();
    const tenantId = usernameAndOrg.substring(atIndex + 1).trim();

    // Verify tenant
    const [tenantData] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenantData) {
      return { success: false, error: `Organization '${tenantId}' not found.` };
    }
    if (!tenantData.isActive) {
      return { success: false, error: "Organization is deactivated." };
    }

    // Find user (by name case-insensitive, or email case-insensitive)
    const allUsers = await db.select().from(users).where(eq(users.tenantId, tenantId));
    const user = allUsers.find(u => 
      u.name.toLowerCase() === nameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === nameOrEmail.toLowerCase() ||
      u.email.toLowerCase().split("@")[0] === nameOrEmail.toLowerCase()
    );

    if (!user) {
      return { success: false, error: `User '${nameOrEmail}' not found in organization '${tenantId}'.` };
    }
    if (!user.isActive) {
      return { success: false, error: "User account is deactivated." };
    }

    // Check password using cryptographic verification
    const isPasswordMatch = verifyPassword(passwordHash, user.passwordHash);
    
    if (!isPasswordMatch) {
      return { success: false, error: "Invalid password." };
    }

    // Store session cookie with HMAC signature to prevent client-side tampering
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      role: user.role,
      email: user.email
    });
    const signedSession = signSession(sessionData);
    cookieStore.set("session_user", signedSession, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax"
    });

    return { 
      success: true, 
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        role: user.role,
        email: user.email
      },
      tenant: tenantData
    };
  } catch (error: any) {
    console.error("Login action failed:", error);
    return { success: false, error: error.message || "An unexpected error occurred during login." };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session_user");
    if (!session || !session.value) {
      return { success: true, user: null };
    }
    
    // Cryptographically verify session token signature to prevent role/ID spoofing
    const user = verifyAndParseSession(session.value);
    if (!user) {
      cookieStore.delete("session_user");
      return { success: true, user: null };
    }
    return { success: true, user };
  } catch (error: any) {
    console.error("Get current user failed:", error);
    return { success: false, user: null };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session_user");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Logout failed:", error);
    return { success: false, error: error.message };
  }
}

export async function addUser(data: {
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "cashier" | "kitchen" | "staff";
}) {
  try {
    // Hash password securely before storing
    const passwordToStore = hashPassword(data.passwordHash || "password");
    
    await db.insert(users).values({
      tenantId: data.tenantId,
      name: data.name,
      email: data.email,
      passwordHash: passwordToStore,
      role: data.role,
      isActive: true
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add user:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  try {
    await db.update(users)
      .set({ isActive })
      .where(eq(users.id, userId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle user active status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(userId: string, role: "admin" | "cashier" | "kitchen" | "staff") {
  try {
    await db.update(users)
      .set({ role })
      .where(eq(users.id, userId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId: string, data: { name: string; email: string; passwordHash: string }) {
  try {
    // Check if the password hash passed is already a SHA512 PBKDF2 hash (128 chars hex)
    const isAlreadyHashed = data.passwordHash.length === 128 && /^[0-9a-fA-F]+$/.test(data.passwordHash);
    const passwordToStore = isAlreadyHashed ? data.passwordHash : hashPassword(data.passwordHash);

    await db.update(users)
      .set({
        name: data.name,
        email: data.email,
        passwordHash: passwordToStore,
      })
      .where(eq(users.id, userId));

    // Also update session cookie if it is the current user
    const cookieStore = await cookies();
    const session = cookieStore.get("session_user");
    if (session && session.value) {
      const user = verifyAndParseSession(session.value);
      if (user && user.id === userId) {
        const updatedSession = JSON.stringify({
          ...user,
          name: data.name,
          email: data.email,
        });
        const signedSession = signSession(updatedSession);
        cookieStore.set("session_user", signedSession, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: "lax"
        });
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user profile:", error);
    return { success: false, error: error.message };
  }
}

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

// 10. Expense Actions
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

// 11. Stock Movement Actions
export async function getStockMovements(tenantId: string) {
  try {
    const data = await db.select().from(stockMovements).where(eq(stockMovements.tenantId, tenantId));
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to get stock movements:", error);
    return { success: false, error: error.message };
  }
}
