import { AlertTriangle } from "lucide-react";

interface AlertProps {
  message: string;
}

export default function Alert({ message }: AlertProps) {
  return (
    <div
      className="bg-rose-500/5 backdrop-blur-md border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl flex items-center shadow-card max-w-7xl mx-auto"
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 mr-3 text-rose-400 flex-shrink-0" />
      <span className="block sm:inline text-xs font-semibold uppercase tracking-wider">{message}</span>
    </div>
  );
}
