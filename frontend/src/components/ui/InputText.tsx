import { SetStateAction } from "react";

interface InputTextProps {
  label: string;
  placeholder: string;
  setter: React.Dispatch<SetStateAction<string>>;
  type: string;
  value?: string;
  required?: boolean;
}

export default function InputText({ 
  label, 
  placeholder, 
  setter, 
  type,
  value,
  required = false 
}: InputTextProps) {
  return (
    <div className="space-y-2 animate-slide-in">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input 
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                   text-white placeholder-gray-400
                   focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none
                   transition-all duration-300 hover:bg-white/[0.15]"
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => setter(e.target.value)}
        required={required}
      />
    </div>
  );
}