import React, { useState } from 'react';
import { signup } from '../../services/auth';
import { Link } from 'react-router-dom';
import CourseSelectionDialog from '../ui/CourseSelectionDialog';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface SignupComponentProps {
  onSignupSuccess: () => void;
  availableCourses: Course[];
}

const SignupComponent: React.FC<SignupComponentProps> = ({ onSignupSuccess, availableCourses }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [showCourseDialog, setShowCourseDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await signup({
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        role: 'student',
        selectedCourses,
      });

      localStorage.setItem('access_token', response.access_token);
      onSignupSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    }
  };

  const handleCourseSelection = (courses: number[]) => {
    setSelectedCourses(courses);
    setShowCourseDialog(false);
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
              alt="Signup"
              className="w-20 h-20 rounded-full animate-scale-in"
            />
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse-glow" />
          </div>
        </div>
        
        <h2 className='text-2xl font-bold mb-6 text-gray-800 text-center animate-fade-in'>Signup</h2>
        
        {error && (
          <p className='text-red-500 mb-4 text-center animate-slide-in'>
            {error}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 stagger-animation">
          {['firstName', 'lastName', 'username', 'email', 'password'].map((field, index) => (
            <div key={field} className="form-field" style={{ animationDelay: `${index * 100}ms` }}>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                id={field}
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 form-input'
                required
                placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
              />
            </div>
          ))}
          
          <div className="form-field">
            <button
              type="button"
              onClick={() => setShowCourseDialog(true)}
              className='w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg
                       hover:from-indigo-600 hover:to-purple-600 transform transition-all duration-300
                       hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            >
              Select Courses ({selectedCourses.length} selected)
            </button>
          </div>
          
          <button
            type="submit"
            className='w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg
                     hover:from-green-600 hover:to-emerald-600 transform transition-all duration-300
                     hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          >
            Signup
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>

      {showCourseDialog && (
        <CourseSelectionDialog
          availableCourses={availableCourses}
          onConfirm={handleCourseSelection}
          onCancel={() => setShowCourseDialog(false)}
        />
      )}
    </div>
  );
};

export default SignupComponent;