import loginImg from '../../assets/ta_login.jpg'; // Change image to TA-specific
import LoginComponent from '../Auth/LoginComponent'; // Reuse existing LoginComponent
import { useNavigate } from 'react-router-dom';

export default function TALogin() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/ta-dashboard'); // Redirect to TA dashboard after successful login
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'>
      <div className='container mx-auto px-4 h-screen'>
        <div className='grid grid-cols-1 lg:grid-cols-2 h-full gap-8'>
          <div className='hidden lg:flex items-center justify-center p-8'>
            <div className='relative w-full max-w-lg'>
              <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob'></div>
              <div className='absolute top-0 -right-4 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
              <div className='absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>
              <img 
                className='relative rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105'
                src={loginImg} 
                alt="TA Login" // Update alt text for accessibility
              />
            </div>
          </div>

          <div className='flex items-center justify-center p-8'>
            <LoginComponent onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
