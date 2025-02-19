import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { clipboard } from 'react-icons-kit/feather/clipboard';
import { users } from 'react-icons-kit/feather/users';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
import { Link, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { fetchCourses } from '../../services/students';


interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

export default function TADashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/ta/login');
      return;
    }

    // Fetch courses from the backend
    const fetchData = async () => {
      try {
        const coursesData = await fetchCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/ta_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">TA Dashboard</h2>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/ta-dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-600"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/assignments" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={clipboard} size={20} />
            <span className="font-medium">Assignments</span>
          </Link>
          <Link 
            to="/students" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={users} size={20} />
            <span className="font-medium">Students</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TA Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/chat')}
            >
              Chat with AI
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        {/* Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Assigned Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link 
                to={`/ta/manage-course/${course.id}`}
                key={course.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                    {course.category}
                  </span>
                  <div className="text-4xl mb-4">{course.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                    Manage Course
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Chat Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon icon={x} size={20} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
}