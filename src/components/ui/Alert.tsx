import { AlertTriangle } from "lucide-react";

interface AlertProps {
  message: string;
}

export default function Alert({ message }: AlertProps) {
  return (
    <div
      className="bg-red-950/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center shadow-lg"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
      <span className="block sm:inline text-sm font-medium">{message}</span>
    </div>
  );
}
