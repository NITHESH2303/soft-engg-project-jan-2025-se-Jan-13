import LoginComponent from '../Auth/LoginComponent';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    if(localStorage.getItem('role') == 'admin') {
      navigate('/admin/dashboard');
    }
    else{
      navigate("/student/dashboard");
    }
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center'>
      <div className='w-full max-w-md'>
        <LoginComponent onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}