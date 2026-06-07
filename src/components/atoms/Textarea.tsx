import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-text-primary rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-300 w-full disabled:opacity-50 min-h-[80px] ${className}`}
      {...props}
    />
  );
}
