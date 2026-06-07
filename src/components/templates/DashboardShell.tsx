import React from "react";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  primaryColor?: string;
}

export default function DashboardShell({
  sidebar,
  topbar,
  children,
  primaryColor = "#f59e0b",
}: DashboardShellProps) {
  return (
    <div
      className="flex min-h-screen bg-zinc-950 text-text-primary"
      style={{
        ["--color-primary" as any]: primaryColor,
      }}
    >
      {/* Sidebar Navigation (Left) */}
      {sidebar}

      {/* Main Content Outer Container (Right) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Topbar Header */}
        {topbar}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
