import React from "react";
import Dashboard from "@/components/Dashboard";
import LoginPageClient from "@/components/LoginPageClient";
import { getDashboardData, getCurrentUser } from "@/db/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userResult = await getCurrentUser();
  const user = userResult.success ? userResult.user : null;

  if (!user) {
    return <LoginPageClient />;
  }

  const tenantId = user.tenantId;
  const result = await getDashboardData(tenantId);

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-primary p-6">
        <div className="bg-surface border border-rose-500/20 p-8 rounded-lg max-w-md text-center space-y-4">
          <h1 className="text-2xl font-display text-rose-400 font-bold uppercase">Database Error</h1>
          <p className="text-xs text-text-secondary">
            Failed to connect to the database. Ensure that your connection string (DATABASE_URL) is correctly set up in .env.local.
          </p>
          <div className="bg-secondary-dark p-3 rounded border border-secondary text-left text-[10px] font-mono text-rose-300 break-all">
            {result.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Dashboard initialData={result.data} tenantId={tenantId} currentUser={user} />
    </div>
  );
}
