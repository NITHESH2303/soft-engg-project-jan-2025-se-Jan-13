import SignupComponent from '../Auth/SignupComponent';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center'>
      <div className='w-full max-w-md'>
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
    </div>
  );
}