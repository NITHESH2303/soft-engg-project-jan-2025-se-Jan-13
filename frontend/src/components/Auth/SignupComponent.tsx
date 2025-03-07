import React, { useState } from 'react';
import { signup } from '../../services/auth';
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

      // Save the token in local storage
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
    <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Signup</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {['firstName', 'lastName', 'username', 'email', 'password'].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              id={field}
              name={field}
              value={formData[field as keyof typeof formData]}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
        ))}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowCourseDialog(true)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Select Courses ({selectedCourses.length} selected)
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Signup
        </button>
      </form>

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
