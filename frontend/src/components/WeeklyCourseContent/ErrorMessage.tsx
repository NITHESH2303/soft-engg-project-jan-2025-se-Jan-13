// ErrorMessage.tsx
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center my-4">
      <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}