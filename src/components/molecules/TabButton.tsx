import React from "react";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  showLabel?: boolean;
  indicator?: boolean;
  className?: string;
}

export default function TabButton({
  isActive,
  onClick,
  icon: Icon,
  label,
  showLabel = true,
  indicator = false,
  className = "",
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 relative group cursor-pointer ${
        isActive
          ? "bg-zinc-900 text-primary border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
      } ${className}`}
    >
      {isActive && indicator && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary animate-pulse" />
      )}
      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-400"}`} />
      {showLabel && (
        <span className={indicator ? "opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 truncate whitespace-nowrap hidden group-hover:inline" : "truncate whitespace-nowrap"}>
          {label}
        </span>
      )}
    </button>
  );
}
