import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import ChatOverlay from '../ui/ChatOverlay';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function CourseAnalytics() {
  const { courseId } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const progressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Progress Score',
        data: [0.3, 0.35, 0.45, 0.42, 0.38, 0.41, 0.39, 0.43],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const completionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [42, 28, 30],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <span className="text-lg font-medium text-gray-600">{localStorage.getItem('username')}</span>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Course Analytics</h1>
            <p className="text-gray-600 mt-2">Track your progress and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-600">21f3001255</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summary Cards */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Quiz Average</h2>
            <div className="text-4xl font-bold text-purple-600">85%</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold mb-4">Assignment Completion</h2>
            <div className="text-4xl font-bold text-green-600">75%</div>
          </div>

          {/* Charts */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
            <Line data={progressData} options={{ responsive: true }} />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xl font-semibold mb-4">Course Completion</h2>
            <Doughnut data={completionData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}