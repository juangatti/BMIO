import React from "react";

interface LedIndicatorProps {
  current?: number;
  capacity?: number;
  status?: "success" | "warning" | "danger" | "inactive" | "active";
  className?: string;
}

export default function LedIndicator({
  current,
  capacity,
  status,
  className = "",
}: LedIndicatorProps) {
  let colorClass = "bg-zinc-800";

  if (current !== undefined && capacity !== undefined) {
    const pct = capacity > 0 ? (current / capacity) * 100 : 0;
    if (pct >= 50) {
      colorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
    } else if (pct >= 15) {
      colorClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
    } else {
      colorClass = "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse";
    }
  } else if (status) {
    switch (status) {
      case "success":
        colorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
        break;
      case "warning":
        colorClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
        break;
      case "danger":
        colorClass = "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse";
        break;
      case "active":
        colorClass = "bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse";
        break;
      case "inactive":
      default:
        colorClass = "bg-zinc-800";
        break;
    }
  }

  return (
    <span className={`h-2.5 w-2.5 rounded-full inline-block ${colorClass} ${className}`} />
  );
}
