import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  let styles = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
  const norm = status.toLowerCase();

  if (norm === "paid" || norm === "confirmed" || norm === "create" || norm === "success") {
    styles = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  } else if (norm === "pending" || norm === "stored" || norm === "warning") {
    styles = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  } else if (norm === "cancelled" || norm === "empty" || norm === "invalid" || norm === "danger" || norm === "error") {
    styles = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  } else if (norm === "update" || norm === "tapped" || norm === "info" || norm === "blue") {
    styles = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${styles} ${className}`}>
      {status}
    </span>
  );
}
