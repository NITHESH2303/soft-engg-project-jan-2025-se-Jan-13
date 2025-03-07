import signupImg from '../../assets/signup.jpg';
import SignupComponent from '../Auth/SignupComponent';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'>
      <div className='container mx-auto px-4 h-screen'>
        <div className='grid grid-cols-1 lg:grid-cols-2 h-full gap-8'>
          <div className='flex items-center justify-center p-8 relative'>
            <SignupComponent 
              onSignupSuccess={handleSignupSuccess} 
              availableCourses={[{
                "id": 1,
                "title": "Business Data Management",
                "category": "Data Science",
                "icon": "📊",
                "description": "Learn to manage and analyze business data effectively"
              },
              {
                "id": 2,
                "title": "Business Analytics",
                "category": "Data Science",
                "icon": "📈",
                "description": "Master the fundamentals of business analytics"
              },
              {
                "id": 3,
                "title": "Modern Application Development - I",
                "category": "Programming",
                "icon": "💻",
                "description": "Build modern web applications using React"
              }]} 
            />
          </div>

          <div className='hidden lg:flex items-center justify-center p-8'>
            <div className='relative w-full max-w-lg'>
              <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob'></div>
              <div className='absolute top-0 -right-4 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
              <div className='absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>
              <img 
                className='relative rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105'
                src={signupImg} 
                alt="Signup" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
