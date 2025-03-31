import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { users } from 'react-icons-kit/feather/users';
import { settings } from 'react-icons-kit/feather/settings';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import ChatOverlay from '../ui/ChatOverlay';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  roll_number: string;
  email_id: string;
  current_term: number;
  completed_courses: Course[];
  current_courses: Course[];
  pending_courses: Course[];
  submissions: Submission[];
}

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  icon: string;
}

interface Submission {
  id: number;
  assignment_id: number;
  course_id: number;
  week_id: number;
  assignment_type: string;
  submitted_at: string;
  submission_content: any;
  score: number;
  graded_at: string;
}

export default function StudentStats() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/students', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setStudents(response.data.students);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch student data');
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Calculate course distribution data
  const calculateCourseDistribution = () => {
    const courseCounts: { [key: string]: number } = {};
    students.forEach(student => {
      student.current_courses.forEach(course => {
        courseCounts[course.title] = (courseCounts[course.title] || 0) + 1;
      });
    });

    return {
      labels: Object.keys(courseCounts),
      datasets: [{
        data: Object.values(courseCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 1,
      }],
    };
  };

  // Calculate course completion status
  const calculateCompletionStatus = () => {
    let completed = 0;
    let current = 0;
    let pending = 0;

    students.forEach(student => {
      completed += student.completed_courses.length;
      current += student.current_courses.length;
      pending += student.pending_courses.length;
    });

    return {
      labels: ['Completed', 'In Progress', 'Pending'],
      datasets: [{
        data: [completed, current, pending],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderWidth: 1,
      }],
    };
  };

  // Calculate submission scores trend
  const calculateScoresTrend = () => {
    const submissions = students.flatMap(student => student.submissions)
      .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

    const dates = submissions.map(sub => new Date(sub.submitted_at).toLocaleDateString());
    const scores = submissions.map(sub => sub.score);

    return {
      labels: dates,
      datasets: [{
        label: 'Assignment Scores',
        data: scores,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      }],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
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
            to="/admin/students" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon icon={users} size={20} />
            <span className="font-medium">Students</span>
          </Link>
          <Link 
            to="/admin/customize-ai" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={settings} size={20} />
            <span className="font-medium">Customize AI</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Student Statistics</h1>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon icon={messageCircle} size={24} />
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Students</h3>
            <p className="text-4xl font-bold text-purple-600">{students.length}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Courses</h3>
            <p className="text-4xl font-bold text-blue-600">
              {new Set(students.flatMap(s => s.current_courses.map(c => c.id))).size}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Submissions</h3>
            <p className="text-4xl font-bold text-green-600">
              {students.reduce((acc, student) => acc + student.submissions.length, 0)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Distribution</h3>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut 
                data={calculateCourseDistribution()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '400ms' }}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Completion Status</h3>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut 
                data={calculateCompletionStatus()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Submission Scores Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Assignment Scores Trend</h3>
          <div className="h-[400px]">
            <Line 
              data={calculateScoresTrend()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Student Performance Over Time'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8 animate-scale-in" style={{ animationDelay: '600ms' }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Student List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Courses
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr 
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.email_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.current_courses.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.completed_courses.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}