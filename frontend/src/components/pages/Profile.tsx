import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { edit2 } from 'react-icons-kit/feather/edit2';
import { mail } from 'react-icons-kit/feather/mail';
import { phone } from 'react-icons-kit/feather/phone';
import { mapPin } from 'react-icons-kit/feather/mapPin';
import { calendar } from 'react-icons-kit/feather/calendar';
import { Link } from 'react-router-dom';
import ChatOverlay from '../ui/ChatOverlay';

interface Course {
  id: number;
  title: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
  grade?: string;
  completionDate?: string;
}

export default function Profile() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const studentInfo = {
    id: '21f3001255',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (234) 567-8900',
    address: 'Chennai, Tamil Nadu',
    program: 'BS in Data Science',
    batch: '2021-2025',
    semester: '5th Semester',
  };

  const completedCourses: Course[] = [
    {
      id: 1,
      title: 'Introduction to Programming',
      progress: 100,
      status: 'completed',
      grade: 'A',
      completionDate: '2023-12-15'
    },
    {
      id: 2,
      title: 'Database Management',
      progress: 100,
      status: 'completed',
      grade: 'A+',
      completionDate: '2023-12-20'
    }
  ];

  const currentCourses: Course[] = [
    {
      id: 3,
      title: 'Business Data Management',
      progress: 65,
      status: 'in-progress'
    },
    {
      id: 4,
      title: 'Business Analytics',
      progress: 45,
      status: 'in-progress'
    },
    {
      id: 5,
      title: 'Modern Application Development - I',
      progress: 75,
      status: 'in-progress'
    }
  ];

  const pendingCourses: Course[] = [
    {
      id: 6,
      title: 'Machine Learning',
      progress: 0,
      status: 'pending'
    },
    {
      id: 7,
      title: 'Deep Learning',
      progress: 0,
      status: 'pending'
    }
  ];

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
          <h2 className="text-xl font-bold">{studentInfo.id}</h2>
          <span className="text-sm text-gray-500">{studentInfo.program}</span>
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
          <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Student Profile</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        <div className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icon icon={edit2} size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={mail} size={20} />
                  <span>{studentInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={phone} size={20} />
                  <span>{studentInfo.phone}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={mapPin} size={20} />
                  <span>{studentInfo.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={calendar} size={20} />
                  <span>{studentInfo.batch}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Academic Progress */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Semester</h3>
              <p className="text-3xl font-bold text-purple-600">{studentInfo.semester}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed Courses</h3>
              <p className="text-3xl font-bold text-green-600">{completedCourses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Courses</h3>
              <p className="text-3xl font-bold text-blue-600">{currentCourses.length}</p>
            </div>
          </section>

          {/* Course Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '300ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Courses</h2>
              <div className="space-y-4">
                {currentCourses.map((course) => (
                  <Link 
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="font-medium text-gray-800 mb-2">{course.title}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 mt-1 block">{course.progress}% Complete</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Completed Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '400ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Courses</h2>
              <div className="space-y-4">
                {completedCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">{course.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Grade: {course.grade}</span>
                      <span className="text-gray-500">Completed: {course.completionDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pending Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Courses</h2>
              <div className="space-y-4">
                {pendingCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-800">{course.title}</h3>
                    <span className="text-sm text-gray-500">Not Started</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}