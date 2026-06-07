"use server";

import { db } from "../index";
import { users, tenants } from "../schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  signSession,
  verifyAndParseSession,
  hashPassword,
  verifyPassword
} from "../auth-utils";

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
