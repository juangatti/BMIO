import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export default function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 w-full disabled:opacity-50 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
