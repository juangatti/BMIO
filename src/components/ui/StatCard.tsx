import React from "react";
import { Package, LucideIcon } from "lucide-react";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
}

export default function StatCard({ label, value, unit, icon: Icon = Package }: StatCardProps) {
  return (
    <Card className="group">
      <div className="p-5 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate"
            title={label}
          >
            {label}
          </p>
          <p className="font-mono text-2xl tracking-tight text-text-primary mt-2">
            {value}{" "}
            {unit && (
              <span className="text-xs font-semibold text-text-muted ml-0.5 lowercase font-sans">
                {unit}
              </span>
            )}
          </p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-3 rounded-xl flex-shrink-0 text-text-secondary group-hover:text-primary transition-colors duration-500">
          <Icon className="h-5 w-5 stroke-[1.5]" />
        </div>
      </div>
    </Card>
  );
}

