import React from "react";
import {
  LayoutDashboard,
  Beer,
  Box,
  BarChart3,
  FileText,
  CalendarRange,
  Layers,
  Clock,
  Users,
  Settings,
} from "lucide-react";
import TabButton from "../molecules/TabButton";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tenantName: string;
  role?: string;
  logoUrl?: string | null;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  tenantName,
  role,
  logoUrl,
}: SidebarProps) {
  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "taps", label: "Beer Taps", icon: Beer },
    { id: "inventory", label: "Products", icon: Box },
    { id: "financials", label: "Financials", icon: BarChart3 },
    { id: "expenses", label: "Expenses", icon: FileText },
    { id: "reservations", label: "Reservations", icon: CalendarRange },
    { id: "prebatches", label: "Prebatches", icon: Layers },
    { id: "schedules", label: "Schedules", icon: Clock },
    ...(role === "admin" ? [{ id: "staff", label: "Staff", icon: Users }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <aside className="w-16 hover:w-64 bg-zinc-950 border-r border-zinc-900/60 flex flex-col shrink-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group fixed md:sticky top-0 bottom-0 h-screen select-none z-40">
      {/* Top section: App Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-zinc-900/60 shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain bg-zinc-900 border border-zinc-800 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            <span className="font-display font-black text-xs text-primary">B</span>
          </div>
        )}
        <div className="hidden group-hover:flex flex-col min-w-0 flex-1 truncate">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-display font-bold text-sm tracking-wider truncate text-primary">
              {tenantName}
            </span>
            <span className="text-[8px] font-mono text-zinc-500 border border-zinc-800 bg-zinc-900/40 px-1 rounded uppercase shrink-0">
              v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto px-2 md:px-3 space-y-1.5">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TabButton
              key={item.id}
              isActive={isActive}
              onClick={() => setActiveTab(item.id)}
              icon={item.icon}
              label={item.label}
              indicator={true}
              className="relative"
            />
          );
        })}
      </nav>
    </aside>
  );
}
