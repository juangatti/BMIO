import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`border border-zinc-800/40 bg-zinc-900/40 rounded-3xl p-1 shadow-card backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${className}`}>
      <div className="bg-zinc-950/70 rounded-[calc(1.5rem-0.25rem)] overflow-hidden h-full">
        {children}
      </div>
    </div>
  );
}

