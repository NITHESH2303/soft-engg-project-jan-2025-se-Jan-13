import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCourses, fetchDeadlines } from '../../services/students';
import Sidebar from '../ui/Sidebar';
import DeadlineItem from '../ui/DeadlineItem';
import ChatOverlay from '../ui/ChatOverlay';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface Deadline {
  id: number;
  course_title: string;
  assignment_no: number;
  deadline: string;
  status: 'Pending' | 'Submitted';
}

export default function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    {
      id: 1,
      course_title: 'Business Data Management',
      assignment_no: 1,
      deadline: '2025-02-26',
      status: 'Submitted'
    },
    {
      id: 2,
      course_title: 'Business Data Management',
      assignment_no: 2,
      deadline: '2025-03-05',
      status: 'Pending'
    },
    {
      id: 3,
      course_title: 'Business Data Management',
      assignment_no: 3,
      deadline: '2025-03-12',
      status: 'Submitted'
    },
    {
      id: 4,
      course_title: 'Business Analytics',
      assignment_no: 1,
      deadline: '2025-02-26',
      status: 'Submitted'
    },
    {
      id: 5,
      course_title: 'Business Analytics',
      assignment_no: 2,
      deadline: '2025-03-05',
      status: 'Pending'
    },
    {
      id: 6,
      course_title: 'Business Analytics',
      assignment_no: 3,
      deadline: '2025-03-12',
      status: 'Submitted'
    },
    {
      id: 7,
      course_title: 'Modern Application Development - I',
      assignment_no: 1,
      deadline: '2025-02-26',
      status: 'Submitted'
    },
    {
      id: 8,
      course_title: 'Modern Application Development - I',
      assignment_no: 2,
      deadline: '2025-03-05',
      status: 'Pending'
    },
    {
      id: 9,
      course_title: 'Modern Application Development - I',
      assignment_no: 3,
      deadline: '2025-03-12',
      status: 'Submitted'
    }]);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    // Fetch courses and deadlines from the backend
    const fetchData = async () => {
      try {
        const coursesData = await fetchCourses();
        const deadlinesData = await fetchDeadlines();
        setCourses(coursesData);
        setDeadlines(deadlinesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const sidebarItems = [
    { icon: home, title: 'Home', href: '/dashboard' },
    { icon: activity, title: 'Performance', href: '/performance' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        profileImage="/iitm_avatar.png"
        profileTitle="21f3001255"
        items={sidebarItems}
      />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
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

        {/* Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link 
                to={`/course/${course.id}`}
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
                    View Course
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Deadlines Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Deadlines</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deadlines.map((deadline) => (
                  <DeadlineItem
                    key={deadline.id}
                    course_title={deadline.course_title}
                    assignment_no={deadline.assignment_no}
                    deadline={deadline.deadline}
                    status={deadline.status}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}