import React, { useState, useEffect } from "react";
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
  PanelLeft,
  Check,
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
  const [sidebarMode, setSidebarMode] = useState<"hover" | "expanded" | "collapsed">("hover");
  const [showModeMenu, setShowModeMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarMode");
    if (saved === "hover" || saved === "expanded" || saved === "collapsed") {
      setSidebarMode(saved);
    }
  }, []);

  const handleModeChange = (mode: "hover" | "expanded" | "collapsed") => {
    setSidebarMode(mode);
    localStorage.setItem("sidebarMode", mode);
    setShowModeMenu(false);
  };

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

  const asideClass = `bg-zinc-950 border-r border-zinc-900/60 flex flex-col shrink-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] fixed md:sticky top-0 bottom-0 h-screen select-none z-40 ${
    sidebarMode === "hover"
      ? "w-16 hover:w-64 group"
      : sidebarMode === "expanded"
        ? "w-64"
        : "w-16"
  }`;

  const brandTextClass = sidebarMode === "hover"
    ? "hidden group-hover:flex flex-col min-w-0 flex-1 truncate"
    : sidebarMode === "expanded"
      ? "flex flex-col min-w-0 flex-1 truncate"
      : "hidden";

  return (
    <aside className={asideClass}>
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
        <div className={brandTextClass}>
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
              sidebarMode={sidebarMode}
            />
          );
        })}
      </nav>

      {/* Bottom Section: Sidebar Preference */}
      <div className="p-2 border-t border-zinc-900/60 shrink-0 relative">
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent transition-all duration-200 relative group cursor-pointer"
          title="Sidebar Mode"
        >
          <PanelLeft className="w-5 h-5 shrink-0 text-zinc-500 group-hover:text-zinc-400" />
          <span className={
            sidebarMode === "hover"
              ? "opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 truncate whitespace-nowrap hidden group-hover:inline text-[13px] font-medium"
              : sidebarMode === "expanded"
                ? "truncate whitespace-nowrap opacity-100 inline text-[13px] font-medium"
                : "hidden"
          }>
            {sidebarMode === "hover" ? "Hover to expand" : sidebarMode === "expanded" ? "Permanently expanded" : "Collapsed"}
          </span>
        </button>

        {showModeMenu && (
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setShowModeMenu(false)}
            />
            <div className="absolute left-full bottom-2 ml-2 bg-zinc-950 border border-zinc-900/80 rounded-xl p-1.5 shadow-2xl min-w-[180px] z-50 flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900/60 mb-1">
                Sidebar Layout
              </div>
              <button
                onClick={() => handleModeChange("hover")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                  sidebarMode === "hover"
                    ? "bg-zinc-900 text-primary font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <span>Expand on hover</span>
                {sidebarMode === "hover" && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
              <button
                onClick={() => handleModeChange("expanded")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                  sidebarMode === "expanded"
                    ? "bg-zinc-900 text-primary font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <span>Permanently expanded</span>
                {sidebarMode === "expanded" && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
              <button
                onClick={() => handleModeChange("collapsed")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                  sidebarMode === "collapsed"
                    ? "bg-zinc-900 text-primary font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <span>Permanently collapsed</span>
                {sidebarMode === "collapsed" && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

