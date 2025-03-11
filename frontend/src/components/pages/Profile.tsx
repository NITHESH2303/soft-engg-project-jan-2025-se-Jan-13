import React, { useEffect, useState } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { mail } from 'react-icons-kit/feather/mail';
import { calendar } from 'react-icons-kit/feather/calendar';
import { user } from 'react-icons-kit/feather/user';
import { book } from 'react-icons-kit/feather/book';
import { checkCircle } from 'react-icons-kit/feather/checkCircle';
import { clock } from 'react-icons-kit/feather/clock';
import { Link } from 'react-router-dom';
import ChatOverlay from '../ui/ChatOverlay';
import Sidebar from '../Student/Sidebar';
import { fetchStudentData, fetchCourses } from '../../services/students';

interface Course {
  id: number;
  title: string;
  icon: string;
  description: string;
  category: string;
}

interface CompletedCourse {
  id: number;
  title: string;
  grade: string;
  completion_date: string;
}

interface PendingCourse {
  id: number;
  title: string;
}

interface StudentData {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email_id: string;
  roll_number: string;
  current_term: number;
  completed_courses: CompletedCourse[];
  pending_courses: PendingCourse[];
}

interface SidebarItem {
  icon: any;
  title: string;
  href: string;
}

const Profile: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentInfo = await fetchStudentData();
        setStudentData(studentInfo);

        const courses = await fetchCourses();
        setCurrentCourses(courses);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const sidebarItems: SidebarItem[] = [
    { icon: home, title: 'Home', href: '/dashboard' },
    { icon: activity, title: 'Performance', href: '/performance' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        profileImage="/iitm_avatar.png"
        profileTitle={studentData.roll_number}
        items={sidebarItems}
      />

      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Student Profile</h1>
          <button 
            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon icon={messageCircle} size={24} />
          </button>
        </header>

        <div className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={mail} size={20} />
                  <span>{studentData.email_id}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={calendar} size={20} />
                  <span>Term {studentData.current_term}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={user} size={20} />
                  <span>{`${studentData.first_name} ${studentData.middle_name} ${studentData.last_name}`}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Icon icon={activity} size={20} />
                  <span>Roll Number: {studentData.roll_number}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Academic Progress */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Term</h3>
              <p className="text-3xl font-bold text-purple-600">{studentData.current_term}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed Courses</h3>
              <p className="text-3xl font-bold text-green-600">{studentData.completed_courses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Courses</h3>
              <p className="text-3xl font-bold text-blue-600">{currentCourses.length}</p>
            </div>
          </section>

          {/* Course Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '300ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Icon icon={book} size={24} className="mr-2 text-blue-500" />
                Current Courses
              </h2>
              <div className="space-y-4">
                {currentCourses.length > 0 ? (
                  currentCourses.map((course) => (
                    <Link 
                      key={course.id}
                      to={`/course/${course.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{course.icon}</span>
                        <h3 className="font-medium text-gray-800">{course.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{course.category}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No current courses available.</p>
                )}
              </div>
            </section>

            {/* Completed Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '400ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Icon icon={checkCircle} size={24} className="mr-2 text-green-500" />
                Completed Courses
              </h2>
              <div className="space-y-4">
                {studentData.completed_courses.length > 0 ? (
                  studentData.completed_courses.map((course) => (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">{course.title}</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Grade: {course.grade}</span>
                        <span className="text-gray-500">Completed on {course.completion_date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No completed courses yet.</p>
                )}
              </div>
            </section>

            {/* Pending Courses */}
            <section className="bg-white rounded-xl shadow-md p-6 animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Icon icon={clock} size={24} className="mr-2 text-yellow-500" />
                Pending Courses
              </h2>
              <div className="space-y-4">
                {studentData.pending_courses.length > 0 ? (
                  studentData.pending_courses.map((course) => (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <span className="text-sm text-yellow-600">Not Started</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No pending courses.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Profile;
