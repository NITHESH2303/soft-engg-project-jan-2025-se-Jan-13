import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import ChatOverlay from '../ui/ChatOverlay';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceData {
  subject: string;
  assignments: number;
  quizzes: number;
  projects: number;
}

export default function Performance() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const performanceData: PerformanceData[] = [
    {
      subject: "Business Data Management",
      assignments: 85,
      quizzes: 78,
      projects: 92
    },
    {
      subject: "Business Analytics",
      assignments: 92,
      quizzes: 88,
      projects: 95
    },
    {
      subject: "Modern Application Development - I",
      assignments: 88,
      quizzes: 82,
      projects: 90
    }
  ];

  const chartData = {
    labels: performanceData.map(data => data.subject),
    datasets: [
      {
        label: 'Assignments',
        data: performanceData.map(data => data.assignments),
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        label: 'Quizzes',
        data: performanceData.map(data => data.quizzes),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Projects',
        data: performanceData.map(data => data.projects),
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Performance Summary',
        color: 'rgb(107, 114, 128)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
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
          <h2 className="text-xl font-bold">21f3001255</h2>
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
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/performance" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Performance</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
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

        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fade-in">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Detailed Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceData.map((subject, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{subject.subject}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assignments</span>
                  <span className="font-medium text-blue-600">{subject.assignments}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quizzes</span>
                  <span className="font-medium text-red-600">{subject.quizzes}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-medium text-yellow-600">{subject.projects}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}