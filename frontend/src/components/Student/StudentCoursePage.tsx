import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Calendar, Users, Clock, Award } from 'lucide-react';
import ErrorMessage from '../WeeklyCourseContent/ErrorMessage';
import LoadingSpinner from '../WeeklyCourseContent/LoadingSpinner';
import Sidebar from './Sidebar';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import WeeklyCourseContent from '../WeeklyCourseContent/WeeklyCourseContent';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  enrolledStudents: number;
  courseImage: string;
  progress: number;
}

export default function StudentCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarItems = [
    { icon: home, title: 'Home', href: '/dashboard' },
    { icon: activity, title: 'Performance', href: '/performance' },
  ];
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`http://127.0.0.1:8000/api/student/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        const data = await response.json();
        setCourse(data);
        
        // Set active week based on current progress or server recommendation
        if (data.currentWeek) {
          setActiveWeek(data.currentWeek);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Fallback for demo purposes
  const dummyCourse: Course = {
    id: parseInt(courseId || '1'),
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This course covers everything from basic markup to advanced interactive web applications.',
    instructor: 'Dr. Jane Smith',
    startDate: '2025-01-15',
    endDate: '2025-04-30',
    totalWeeks: 12,
    enrolledStudents: 127,
    courseImage: '/course-image.jpg',
    progress: 25
  };

  // Use dummy data if API fails or for development
  const courseData = course || dummyCourse;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed width sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar
          profileImage="/iitm_avatar.png"
          profileTitle="21f3001255"
          items={sidebarItems}
        />
      </div>
      
      {/* Main content area with proper padding */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} />
          </div>
        ) : (
          <div className="p-6 max-w-6xl mx-auto">
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
                <p className="text-indigo-100 mb-4">{courseData.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <BookOpen size={18} className="mr-2" />
                    <span>{courseData.totalWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={18} className="mr-2" />
                    <span>{courseData.enrolledStudents} Students</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2" />
                    <span>{courseData.startDate} to {courseData.endDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">Week {activeWeek} of {courseData.totalWeeks}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${courseData.progress}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>0%</div>
                  <div className="flex items-center">
                    <Award size={16} className="mr-1 text-indigo-600" />
                    <span className="font-medium text-indigo-600">{courseData.progress}% Complete</span>
                  </div>
                  <div>100%</div>
                </div>
              </div>
            </div>
            
            {/* Week Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Course Content</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: courseData.totalWeeks }, (_, i) => i + 1).map((week) => (
                  <button
                    key={week}
                    className={`p-3 rounded-lg border ${
                      activeWeek === week
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    } transition-colors duration-200`}
                    onClick={() => setActiveWeek(week)}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Weekly Content */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <WeeklyCourseContent 
                courseId={courseData.id} 
                weekNo={activeWeek} 
                role="student" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}