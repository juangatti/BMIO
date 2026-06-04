import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-surface/50 backdrop-blur-md shadow-card hover:shadow-card-hover transition-all duration-500 rounded-xl overflow-hidden border border-secondary-light/30 hover:border-secondary-light/60">
      {children}
    </div>
  );
}
