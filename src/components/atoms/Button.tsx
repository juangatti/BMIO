import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "amber";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  let baseStyles = "rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-2 cursor-pointer shadow-md";
  let variantStyles = "";

  if (variant === "primary") {
    variantStyles = "bg-primary hover:bg-primary-dark text-secondary-dark px-4 py-2.5 shadow-primary/10 border border-primary/20 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-transparent";
  } else if (variant === "secondary") {
    variantStyles = "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-text-primary px-4 py-2.5";
  } else if (variant === "danger") {
    variantStyles = "border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-3 py-1.5 shadow-none";
  } else if (variant === "amber") {
    variantStyles = "bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-secondary-dark py-1.5 px-4 shadow-amber-500/10";
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
