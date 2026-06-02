import React from "react";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import StatCard from "@/components/ui/StatCard";
import { Coffee, Beer, DollarSign, TrendingUp } from "lucide-react";

export default function Home() {
  const currentTenant = process.env.NEXT_PUBLIC_CURRENT_TENANT_ID || "unknown-tenant";

  return (
    <div className="flex-1 bg-background text-text-primary p-6 sm:p-12">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-secondary pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary tracking-wide">
            Bar Manager IO
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gastronomy SaaS Control Panel
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <span className="text-xs bg-secondary px-3 py-1.5 rounded-full border border-secondary-light/20 font-mono text-text-muted">
            Tenant: {currentTenant}
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Alert Zone */}
        <section>
          <Alert message="Attention: Happy Hour starts in 30 minutes. Make sure the beer taps are calibrated and menu pricing is synchronized." />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Beer Taps"
            value="14"
            unit="/ 16"
            icon={Beer}
          />
          <StatCard
            label="Chalkboard Specials Active"
            value="5"
            unit="items"
            icon={Coffee}
          />
          <StatCard
            label="Total Night Sales"
            value="$2,450"
            unit="USD"
            icon={DollarSign}
          />
          <StatCard
            label="Average Table Turnover"
            value="42"
            unit="min"
            icon={TrendingUp}
          />
        </section>

        {/* Main Content Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-display text-text-primary">
                  Tonight's Performance Overview
                </h2>
                <p className="text-sm text-text-secondary">
                  Real-time sales velocity monitoring for tenant <span className="text-primary font-semibold">{currentTenant}</span>.
                </p>
                <div className="h-48 bg-secondary-dark rounded border border-secondary flex items-center justify-center text-text-muted">
                  [ Live Sales Graph Placeholder ]
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-display text-text-primary">
                  Kitchen Sync Status
                </h2>
                <p className="text-sm text-text-secondary">
                  Syncing live order updates from kitchen display systems.
                </p>
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-secondary rounded-lg">
                  <Spinner />
                  <span className="text-xs text-text-muted mt-2">Connecting to local POS...</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-16 border-t border-secondary pt-6 text-center text-xs text-text-muted">
        &copy; {new Date().getFullYear()} Bar Manager IO. All rights reserved.
      </footer>
    </div>
  );
}
