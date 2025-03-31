import React, { useState } from 'react';
import { loginActual } from '../../services/auth';
import { Link } from 'react-router-dom';

interface LoginComponentProps {
  onLoginSuccess: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginActual(username, password);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('sub', response.sub);
      localStorage.setItem('role', response.role);
      onLoginSuccess();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className='relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md form-container'>
      {/* Animated background blobs */}
      <div className="floating-blob w-64 h-64 bg-purple-300/30 -top-32 -left-32" />
      <div className="floating-blob-reverse w-64 h-64 bg-indigo-300/30 -bottom-32 -right-32" />
      
      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img 
              src="https://th.bing.com/th/id/OSK.fc0b485845f18bc6c70439044750149e?w=80&h=80&r=0&o=6&cb=B&pid=23.1"
              alt="Login"
              className="w-20 h-20 rounded-full animate-scale-in"
            />
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse-glow" />
          </div>
        </div>
        
        <h2 className='text-2xl font-bold mb-6 text-gray-800 text-center animate-fade-in'>Login</h2>
        
        {error && (
          <p className='text-red-500 mb-4 text-center animate-slide-in'>
            {error}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 stagger-animation">
          <div className="form-field">
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='username'>
              Username
            </label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 form-input'
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-field">
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
              Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 form-input'
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type='submit'
            className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg 
                     hover:from-purple-700 hover:to-indigo-700 transform transition-all duration-300
                     hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;