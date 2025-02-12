import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye'
import { SetStateAction, useState } from 'react';

interface InputPasswordProps {
  password: string;
  setPassword: React.Dispatch<SetStateAction<string>>;
  required?: boolean;
}

export default function InputPassword({ 
  setPassword, 
  password,
  required = false 
}: InputPasswordProps) {
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type === 'password') {
      setIcon(eye);
      setType('text');
    } else {
      setIcon(eyeOff);
      setType('password');
    }
  }

  return (
    <div className="space-y-2 animate-slide-in">
      <label className="block text-sm font-medium text-gray-300">
        Password
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={required}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none
                     transition-all duration-300 hover:bg-white/[0.15]"
        />
        <button 
          type="button"
          onClick={handleToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 
                     text-gray-400 hover:text-purple-400 
                     transition-colors duration-200"
        >
          <Icon icon={icon} size={20}/>
        </button>
      </div>
    </div>
  );
}