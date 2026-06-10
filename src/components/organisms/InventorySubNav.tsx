import React from "react";
import { FileText, Beer, Box, History } from "lucide-react";

interface InventorySubNavProps {
  activeSubTab: "stock" | "files" | "recipes" | "products" | "detail" | "movements";
  onSubTabSwitch: (tab: any) => void;
  isMobile?: boolean;
}

export default function InventorySubNav({
  activeSubTab,
  onSubTabSwitch,
  isMobile = false,
}: InventorySubNavProps) {
  const items = [
    { id: "files", label: "Ingredients", icon: FileText },
    { id: "products", label: "Products", icon: Beer },
    { id: "stock", label: "Stock", icon: Box },
    { id: "movements", label: "Stock Movements", icon: History },
  ] as const;

  if (isMobile) {
    return (
      <nav className="flex md:hidden flex-row gap-1 overflow-x-auto pb-4 select-none w-full">
        {items.map((item) => {
          const isActive = activeSubTab === item.id || (item.id === "files" && activeSubTab === "detail");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSubTabSwitch(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer border ${
                isActive
                  ? "bg-zinc-900 text-primary border-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-16 flex items-center px-4 border-b border-zinc-900/60 font-display font-bold text-xs tracking-widest text-text-secondary uppercase select-none">
        Products
      </div>
      <nav className="flex-1 py-4 px-2.5 space-y-0.5">
        {items.map((item) => {
          const isActive = activeSubTab === item.id || (item.id === "files" && activeSubTab === "detail");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSubTabSwitch(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 truncate justify-start cursor-pointer border ${
                isActive
                  ? "bg-zinc-900 text-primary border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  : "text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/30 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
