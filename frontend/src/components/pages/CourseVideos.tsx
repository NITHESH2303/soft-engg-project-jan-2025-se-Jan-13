import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
import { chevronDown } from 'react-icons-kit/feather/chevronDown';
import { chevronUp } from 'react-icons-kit/feather/chevronUp';
import { pieChart } from 'react-icons-kit/feather/pieChart';
import { Link, useParams } from 'react-router-dom';
import Chat from './Chat';

interface Course {
  id: number;
  title: string;
  description: string;
  weeks: Week[];
}

interface Week {
  id: number;
  title: string;
  videos: {
    id: number;
    title: string;
    duration: string;
    completed: boolean;
  }[];
  assignment?: {
    title: string;
    dueDate: string;
    status: 'pending' | 'submitted';
  };
}

const courses: Course[] = [
  {
    id: 1,
    title: "Business Data Management",
    description: "Learn to manage and analyze business data effectively",
    weeks: [
      {
        id: 1,
        title: 'Introduction to Data Management',
        videos: [
          { id: 1, title: 'What is Data Management?', duration: '10:30', completed: true },
          { id: 2, title: 'Types of Business Data', duration: '15:45', completed: false },
          { id: 3, title: 'Data Collection Methods', duration: '12:20', completed: false }
        ],
        assignment: {
          title: 'Week 1 Assignment',
          dueDate: '2025-02-15',
          status: 'pending'
        }
      },
      // Add more weeks...
    ]
  },
  {
    id: 2,
    title: "Business Analytics",
    description: "Master the fundamentals of business analytics",
    weeks: [
      {
        id: 1,
        title: 'Introduction to Analytics',
        videos: [
          { id: 1, title: 'What is Business Analytics?', duration: '12:30', completed: true },
          { id: 2, title: 'Analytics Tools Overview', duration: '18:45', completed: false },
          { id: 3, title: 'Data Analysis Process', duration: '15:20', completed: false }
        ],
        assignment: {
          title: 'Week 1 Assignment',
          dueDate: '2025-02-15',
          status: 'pending'
        }
      },
      // Add more weeks...
    ]
  },
  {
    id: 3,
    title: "Modern Application Development - I",
    description: "Build modern web applications using React",
    weeks: [
      {
        id: 1,
        title: 'Getting Started with React',
        videos: [
          { id: 1, title: 'Introduction to React', duration: '15:30', completed: true },
          { id: 2, title: 'Components and Props', duration: '20:45', completed: false },
          { id: 3, title: 'State and Lifecycle', duration: '18:20', completed: false }
        ],
        assignment: {
          title: 'Week 1 Assignment',
          dueDate: '2025-02-15',
          status: 'pending'
        }
      },
      // Add more weeks...
    ]
  }
];

export default function CourseVideos() {
  const { courseId } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(1);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const currentCourse = courses.find(c => c.id === Number(courseId));
    if (currentCourse) {
      setCourse(currentCourse);
    }
  }, [courseId]);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
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
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to={`/course/${courseId}/analytics`}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors animate-scale-in"
            >
              <Icon icon={pieChart} size={20} />
              <span>Analytics</span>
            </Link>
            <span className="text-lg font-medium text-gray-600">21f3001255</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {course.weeks.map((week) => (
              <div 
                key={week.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden animate-scale-in"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">{week.title}</h3>
                  <Icon 
                    icon={expandedWeek === week.id ? chevronUp : chevronDown} 
                    size={20}
                    className="text-gray-500"
                  />
                </button>
                
                {expandedWeek === week.id && (
                  <div className="px-6 pb-4 space-y-3">
                    {week.videos.map((video) => (
                      <button
                        key={video.id}
                        className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
                          selectedVideo === video.id 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedVideo(video.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${video.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium">{video.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">{video.duration}</span>
                      </button>
                    ))}
                    
                    {week.assignment && (
                      <Link
                        to={`/course/${courseId}/assignment/${week.id}`}
                        className="mt-4 p-4 bg-gray-50 rounded-lg block hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-800">{week.assignment.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            week.assignment.status === 'submitted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {week.assignment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Due: {week.assignment.dueDate}</p>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg mb-6">
                {/* Video player placeholder */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-opacity-50">Video Player</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Introduction to Course</h2>
                <p className="text-gray-600">
                  Learn the fundamentals and get started with the course materials.
                </p>
                
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    Mark as Complete
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Download Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
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