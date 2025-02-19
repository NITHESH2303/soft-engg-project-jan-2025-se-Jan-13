import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { settings } from 'react-icons-kit/feather/settings';
import { bell } from 'react-icons-kit/feather/bell';
import { x } from 'react-icons-kit/feather/x';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchCourses } from '../../services/students';
import CourseCard from '../ui/CourseCard';
import Sidebar from '../ui/Sidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}
interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

export default function InstructorDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([{
    id: 1,
    title: "English-I",
    category: "Language",
    icon: "🇬🇧",
    description: "Introductory English course covering grammar and composition."
  },
  {
    id: 2,
    title: "Programming with Python",
    category: "Computer Science",
    icon: "🐍",
    description: "Learn the basics of programming using Python language."
  }]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    // const accessToken = localStorage.getItem('access_token');
    // if (!accessToken) {
    //   navigate('/login'); // Redirect to login if not logged in
    //   return;
    // }

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
  const sidebarItems = [
    { icon: home, title: 'Home', href: '/dashboard' },
    { icon: activity, title: 'Performance', href: '/performance' },
    { icon: settings, title: 'Customize AI agents', href: '/admin/customize-ai' },
    { icon: bell, title: 'Course Content Approval (2)', href: '/admin/content-approval' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        profileImage="/iitm_avatar.png"
        profileTitle="Course Instructor"
        items={sidebarItems}
      />

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
              <CourseCard key={course.id} course={course} />
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
