import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-surface shadow-card hover:shadow-card-hover transition-shadow duration-300 rounded-lg overflow-hidden border border-secondary">
      {children}
    </div>
  );
}
