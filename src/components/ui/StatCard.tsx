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
    <div className="bg-surface p-4 rounded-lg shadow-card border border-secondary hover:border-primary-dark transition-colors duration-300">
      <div className="flex items-center">
        <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p
            className="text-sm font-medium text-text-secondary line-clamp-2 min-h-[2.5em]"
            title={label}
          >
            {label}
          </p>
          <p className="text-2xl font-bold text-text-primary truncate">
            {value}{" "}
            {unit && (
              <span className="text-sm font-medium text-text-muted ml-1">
                {unit}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
