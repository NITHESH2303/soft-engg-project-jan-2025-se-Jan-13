import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
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
import Chat from './Chat';
import Sidebar from '../ui/Sidebar';
import PerformanceCard from '../ui/PerformanceCard';

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

  const sidebarItems = [
    { icon: home, title: 'Home', href: '/dashboard' },
    { icon: activity, title: 'Performance', href: '/performance' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        profileImage="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
        profileTitle="21f3001255"
        items={sidebarItems}
      />

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
            <PerformanceCard
              key={index}
              subject={subject.subject}
              assignments={subject.assignments}
              quizzes={subject.quizzes}
              projects={subject.projects}
              index={index}
            />
          ))}
        </div>
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