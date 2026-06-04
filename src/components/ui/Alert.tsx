import { AlertTriangle } from "lucide-react";

interface AlertProps {
  message: string;
}

export default function Alert({ message }: AlertProps) {
  return (
    <div
      className="p-1 bg-rose-950/10 border border-rose-500/10 rounded-2xl backdrop-blur-md shadow-lg max-w-7xl mx-auto"
      role="alert"
    >
      <div className="bg-rose-950/20 px-4 py-3 rounded-[calc(1rem-0.25rem)] flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
        <span className="block sm:inline text-[10px] font-bold text-rose-300 uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
}

