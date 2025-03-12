import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Activity, BookOpen, Calendar, Users, Clock, Award, CheckCircle, MessageCircle } from 'lucide-react';
import ErrorMessage from '../WeeklyCourseContent/ErrorMessage';
import LoadingSpinner from '../WeeklyCourseContent/LoadingSpinner';
import WeeklyCourseContent from '../WeeklyCourseContent/WeeklyCourseContent';
import { fetchCourseContent } from '../../services/students';
import ChatOverlay from '../ui/ChatOverlay';

interface Week {
  week_no: number;
  term: string;
  upload_date: string;
  videos: any[];
  practice_assignments: any[];
  graded_assignments: any[];
}

interface CourseData {
  course_id: number;
  weeks: Week[];
}

export default function StudentCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekProgress, setWeekProgress] = useState<Record<number, number>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourseContent(courseId);
        setCourseData(data);
        
        // Initialize progress and expanded state for each week
        const initialProgress: Record<number, number> = {};
        const initialExpanded: Record<number, boolean> = {};
        data.weeks.forEach((week: Week) => {
          const totalItems = week.videos.length + 
                           week.practice_assignments.length + 
                           week.graded_assignments.length;
          initialProgress[week.week_no] = 0;
          initialExpanded[week.week_no] = false;
        });
        setWeekProgress(initialProgress);
        setExpandedItems(initialExpanded);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const calculateWeekProgress = (weekNo: number) => {
    if (!courseData) return 0;
    const week = courseData.weeks.find(w => w.week_no === weekNo);
    if (!week) return 0;

    const totalItems = week.videos.length + 
                      week.practice_assignments.length + 
                      week.graded_assignments.length;
    if (totalItems === 0) return 0;

    // Ensure progress doesn't exceed 100%
    const progress = Math.min((weekProgress[weekNo] / totalItems) * 100, 100);
    return progress;
  };

  const updateWeekProgress = (weekNo: number, completed: number) => {
    setWeekProgress(prev => ({
      ...prev,
      [weekNo]: completed
    }));
  };

  const toggleWeekContent = (weekNo: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [weekNo]: !prev[weekNo]
    }));
    
    // Update progress when week is expanded
    if (!expandedItems[weekNo]) {
      updateWeekProgress(weekNo, weekProgress[weekNo] + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/student/dashboard" className="flex items-center text-gray-700 hover:text-purple-600">
                <Home className="w-5 h-5 mr-2" />
                Home
              </Link>
              <Link to="/student/performance" className="flex items-center text-gray-700 hover:text-purple-600">
                <Activity className="w-5 h-5 mr-2" />
                Performance
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center text-gray-700 hover:text-purple-600"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Course Content */}
        <div className="w-64 bg-white h-[calc(100vh-4rem)] shadow-md overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h2>
            {courseData?.weeks.map((week) => (
              <div key={week.week_no} className="mb-4">
                <button
                  onClick={() => toggleWeekContent(week.week_no)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeWeek === week.week_no
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Week {week.week_no}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(calculateWeekProgress(week.week_no))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${calculateWeekProgress(week.week_no)}%` }}
                    ></div>
                  </div>

                  {expandedItems[week.week_no] && (
                    <div className="mt-3 space-y-2 pl-2">
                      {week.videos.map((video, idx) => (
                        <button
                          key={`video-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWeek(week.week_no);
                            updateWeekProgress(week.week_no, weekProgress[week.week_no] + 1);
                          }}
                          className="flex items-center text-sm text-gray-600 hover:text-purple-600 w-full py-1"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          {video.title}
                        </button>
                      ))}
                      {week.practice_assignments.map((assignment, idx) => (
                        <button
                          key={`practice-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWeek(week.week_no);
                            updateWeekProgress(week.week_no, weekProgress[week.week_no] + 1);
                          }}
                          className="flex items-center text-sm text-gray-600 hover:text-purple-600 w-full py-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Practice Assignment {idx + 1}
                        </button>
                      ))}
                      {week.graded_assignments.map((assignment, idx) => (
                        <button
                          key={`graded-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWeek(week.week_no);
                            updateWeekProgress(week.week_no, weekProgress[week.week_no] + 1);
                          }}
                          className="flex items-center text-sm text-gray-600 hover:text-purple-600 w-full py-1"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Graded Assignment {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : courseData ? (
            <WeeklyCourseContent 
              courseId={parseInt(courseId || '0')} 
              weekNo={activeWeek}
              role="student"
              onProgressUpdate={(completed) => updateWeekProgress(activeWeek, completed)}
            />
          ) : null}
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}