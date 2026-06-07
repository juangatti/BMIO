import React from "react";

interface BreadcrumbProps {
  activeTab: string;
}

export default function Breadcrumb({ activeTab }: BreadcrumbProps) {
  const formatBreadcrumb = (tab: string) => {
    const map: Record<string, string> = {
      overview: "Overview",
      taps: "Beer Taps",
      inventory: "Products",
      movements: "Stock Movements",
      financials: "Financials",
      expenses: "Expenses",
      reservations: "Reservations",
      prebatches: "Prebatches",
      schedules: "Schedules",
      staff: "Staff",
      settings: "Settings",
    };
    return map[tab] || tab;
  };

  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400">
      <span className="hover:text-zinc-200 transition-colors">Dashboard</span>
      <span className="text-zinc-600">/</span>
      <span className="text-primary font-bold font-mono tracking-wide uppercase">
        {formatBreadcrumb(activeTab)}
      </span>
    </div>
  );
}
