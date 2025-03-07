import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { settings } from 'react-icons-kit/feather/settings';
import { bell } from 'react-icons-kit/feather/bell';
import { x } from 'react-icons-kit/feather/x';
import { Link, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchCoursesAdmin } from '../../services/admin.ts';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

export default function InstructorDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    // Fetch courses from the backend
    const fetchData = async () => {
      try {
        const coursesData = await fetchCoursesAdmin();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  // Dummy data for charts
  const studentDistributionData = {
    labels: courses.map(course => course.title),
    datasets: [{
      data: courses.map(() => Math.floor(Math.random() * 50) + 10),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ],
    }]
  };

  const coursePerformanceData = {
    labels: courses.map(course => course.title),
    datasets: [{
      label: 'Average Score',
      data: courses.map(() => Math.floor(Math.random() * 20) + 70),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">Course Instructor</h2>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/performance" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Performance</span>
          </Link>
          <Link 
            to="/admin/customize-ai" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={settings} size={20} />
            <span className="font-medium">Customize AI agents</span>
          </Link>
          <Link 
            to="/admin/content-approval" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={bell} size={20} />
            <span className="font-medium">Course Content Approval (2)</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
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
                to={`/manage-course/${course.id}`}
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
                  <span className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center">
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

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Student Distribution</h3>
            <Pie data={studentDistributionData} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Course Performance</h3>
            <Bar 
              data={coursePerformanceData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
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
