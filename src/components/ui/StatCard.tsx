import React from "react";
import { Package, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
}

export default function StatCard({ label, value, unit, icon: Icon = Package }: StatCardProps) {
  return (
    <div className="bg-surface/50 backdrop-blur-md p-5 rounded-xl shadow-card border border-secondary-light/30 hover:border-primary/30 transition-all duration-500 group">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate"
            title={label}
          >
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-text-primary tracking-wide mt-2">
            {value}{" "}
            {unit && (
              <span className="text-xs font-semibold text-text-muted ml-0.5 lowercase">
                {unit}
              </span>
            )}
          </p>
        </div>
        <div className="bg-secondary-dark/80 border border-secondary p-3 rounded-xl flex-shrink-0 text-text-secondary group-hover:text-primary transition-colors duration-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
