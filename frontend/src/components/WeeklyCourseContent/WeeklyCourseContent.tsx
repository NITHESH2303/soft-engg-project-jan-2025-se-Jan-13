import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, Award } from 'lucide-react';
import AssignmentViewer from './AssignmentViewer';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import VideoViewer from './VideoViewer';

// Updated interfaces based on backend response
export interface Video {
  title: string;
  transcript: string;
  duration: string;
  video_link: string;
  course_id: number;
  week_no: number;
}

export interface AssignmentContent {
  id: number;
  question: string;
  type: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  points: number;
  answer: string;
  hint: string;
  comment: string;
}

export interface Assignment {
  title: string;
  deadline: string;
  is_coding_assignment: boolean;
  description: string;
  assignment_content: AssignmentContent[];
  course_id: number;
  week_no: number;
}

export interface WeekContent {
  id?: number;
  course_id: number;
  week_no: number;
  term?: string;
  upload_date?: string;
  created_at?: string;
  modified_at?: string | null;
  video_lectures: Video[];
  practice_assignments: Assignment[];
  graded_assignments: Assignment[];
}

interface Week {
  title: string | null;
  week_no: number;
  term: string;
  upload_date: string;
}

interface CourseData {
  course_id: number;
  weeks: Week[];
}

interface WeeklyCourseContentProps {
  courseId: number;
  role: 'admin' | 'student';
  onProgressUpdate?: (completed: number) => void;
}

export default function WeeklyCourseContent({ 
  courseId, 
  role,
  onProgressUpdate
}: WeeklyCourseContentProps) {
  // Course level state
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  
  // Week level state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});
  const [weekProgress, setWeekProgress] = useState<Record<number, number>>({});
  const [weekContents, setWeekContents] = useState<Record<number, WeekContent | null>>({});
  const [loadingWeeks, setLoadingWeeks] = useState<Record<number, boolean>>({});
  const [weekErrors, setWeekErrors] = useState<Record<number, string | null>>({});
  
  // Content selection state
  const [selectedContent, setSelectedContent] = useState<{ 
    weekNo: number;
    type: 'video' | 'practice' | 'graded'; 
    index: number 
  } | null>(null);
  
  const isAdmin = role === 'admin';

  // Fetch course data on initial load
  useEffect(() => {
    const fetchCourse = async () => {
      setLoadingCourse(true);
      setCourseError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000:8000/api/student/course/${courseId}/weeks`);
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        const data = await response.json();
        setCourseData(data);
        
        // Initialize expanded state and progress for each week
        const initialExpanded: Record<number, boolean> = {};
        const initialProgress: Record<number, number> = {};
        const initialLoading: Record<number, boolean> = {};
        const initialErrors: Record<number, string | null> = {};
        
        data.weeks.forEach((week: Week) => {
          initialExpanded[week.week_no] = false;
          initialProgress[week.week_no] = 0;
          initialLoading[week.week_no] = false;
          initialErrors[week.week_no] = null;
        });
        
        setExpandedWeeks(initialExpanded);
        setWeekProgress(initialProgress);
        setLoadingWeeks(initialLoading);
        setWeekErrors(initialErrors);
      } catch (error) {
        console.error('Error fetching course:', error);
        setCourseError('Failed to load course details. Please try again later.');
      } finally {
        setLoadingCourse(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Fetch week content when a week is expanded
  const fetchWeekContent = async (weekNo: number) => {
    setLoadingWeeks(prev => ({ ...prev, [weekNo]: true }));
    setWeekErrors(prev => ({ ...prev, [weekNo]: null }));
    
    try {
      const endpoint = isAdmin 
        ? `http://127.0.0.1:8000:8000/api/admin/weekwise-content/course/${courseId}/week/${weekNo}`
        : `http://127.0.0.1:8000:8000/api/admin/weekwise-content/course/${courseId}/week/${weekNo}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      
      const formattedData = {
        ...data,
        video_lectures: data.video_lectures || [],
        practice_assignments: data.practice_assignments || [],
        graded_assignments: data.graded_assignments || []
      };
      
      setWeekContents(prev => ({ 
        ...prev, 
        [weekNo]: formattedData 
      }));
      
      // Update progress if callback provided
      if (onProgressUpdate) {
        onProgressUpdate(calculateWeekProgress(weekNo, formattedData));
      }
    } catch (error) {
      console.error('Error fetching week content:', error);
      setWeekErrors(prev => ({ 
        ...prev, 
        [weekNo]: 'Failed to fetch week content' 
      }));
    } finally {
      setLoadingWeeks(prev => ({ ...prev, [weekNo]: false }));
    }
  };

  // Calculate progress for a week based on completed items
  const calculateWeekProgress = (weekNo: number, weekContent?: WeekContent | null) => {
    const content = weekContent || weekContents[weekNo];
    if (!content) return 0;
    
    // Calculate total items
    const totalItems = 
      content.video_lectures.length + 
      content.practice_assignments.length + 
      content.graded_assignments.length;
    
    if (totalItems === 0) return 0;
    
    // Calculate viewed items (if the week is expanded, count all items as viewed)
    const isExpanded = expandedWeeks[weekNo];
    if (isExpanded) {
      return 100; // Return 100% when the week is expanded
    }
    
    return 0;
  };

  // Handle expanding/collapsing a week
  const toggleWeekExpansion = (weekNo: number) => {
    const isCurrentlyExpanded = expandedWeeks[weekNo];
    
    // If we're expanding and don't have content yet, fetch it
    if (!isCurrentlyExpanded && !weekContents[weekNo]) {
      fetchWeekContent(weekNo);
    }
    
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNo]: !prev[weekNo]
    }));
    
    // Update progress
    if (!isCurrentlyExpanded) {
      setWeekProgress(prev => ({
        ...prev,
        [weekNo]: (prev[weekNo] || 0) + 1
      }));
    }
  };

  // Handle selecting a specific content item
  const handleSelectContent = (weekNo: number, type: 'video' | 'practice' | 'graded', index: number) => {
    setSelectedContent({ weekNo, type, index });
    
    // Update progress
    setWeekProgress(prev => ({
      ...prev,
      [weekNo]: (prev[weekNo] || 0) + 5
    }));
    
    if (onProgressUpdate) {
      onProgressUpdate((weekProgress[weekNo] || 0) + 5);
    }
  };

  // Handle content updates (for admin role)
  const handleContentUpdate = async (weekNo: number, updatedContent: WeekContent) => {
    if (!isAdmin) return;
    
    setLoadingWeeks(prev => ({ ...prev, [weekNo]: true }));
    try {
      const response = await fetch(
        `http://127.0.0.1:8000:8000/api/admin/weekwise-content/${courseId}/${weekNo}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedContent),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update content');
      }
      
      setWeekContents(prev => ({
        ...prev,
        [weekNo]: updatedContent
      }));
    } catch (error) {
      setWeekErrors(prev => ({
        ...prev,
        [weekNo]: 'Failed to update content'
      }));
      console.error('Error updating content:', error);
    } finally {
      setLoadingWeeks(prev => ({ ...prev, [weekNo]: false }));
    }
  };

  // Get the content to display in the main area
  const getSelectedContentItem = () => {
    if (!selectedContent) return null;
    
    const { weekNo, type, index } = selectedContent;
    const weekContent = weekContents[weekNo];
    if (!weekContent) return null;
    
    if (type === 'video') {
      return {
        type: 'video',
        content: weekContent.video_lectures[index],
        onUpdate: (updatedVideo: Video) => {
          if (isAdmin && weekContent) {
            const updatedContent = {
              ...weekContent,
              video_lectures: weekContent.video_lectures.map((v, i) => 
                i === index ? updatedVideo : v
              )
            };
            handleContentUpdate(weekNo, updatedContent);
          }
        }
      };
    } else if (type === 'practice') {
      return {
        type: 'assignment',
        assignmentType: 'practice',
        content: weekContent.practice_assignments[index],
        onUpdate: (updatedAssignment: Assignment) => {
          if (isAdmin && weekContent) {
            const updatedContent = {
              ...weekContent,
              practice_assignments: weekContent.practice_assignments.map((a, i) => 
                i === index ? updatedAssignment : a
              )
            };
            handleContentUpdate(weekNo, updatedContent);
          }
        }
      };
    } else if (type === 'graded') {
      return {
        type: 'assignment',
        assignmentType: 'graded',
        content: weekContent.graded_assignments[index],
        onUpdate: (updatedAssignment: Assignment) => {
          if (isAdmin && weekContent) {
            const updatedContent = {
              ...weekContent,
              graded_assignments: weekContent.graded_assignments.map((a, i) => 
                i === index ? updatedAssignment : a
              )
            };
            handleContentUpdate(weekNo, updatedContent);
          }
        }
      };
    }
    
    return null;
  };

  const selectedItem = getSelectedContentItem();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Course Content */}
      <div className="w-64 bg-white h-full shadow-md overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h2>
          
          {loadingCourse && <LoadingSpinner />}
          {courseError && <ErrorMessage message={courseError} />}
          
          {courseData?.weeks.map((week) => (
            <div key={week.week_no} className="mb-4">
              <button
                onClick={() => toggleWeekExpansion(week.week_no)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedContent?.weekNo === week.week_no
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
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-1">
                    {week.term}
                  </span>
                  {expandedWeeks[week.week_no] ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </div>
              </button>
              
              {expandedWeeks[week.week_no] && (
                <div className="mt-2 ml-3 space-y-1">
                  {loadingWeeks[week.week_no] && <LoadingSpinner />}
                  {weekErrors[week.week_no] && <ErrorMessage message={weekErrors[week.week_no] || ''} />}
                  
                  {weekContents[week.week_no]?.video_lectures.map((video, idx) => (
                    <button
                      key={`video-${idx}`}
                      onClick={() => handleSelectContent(week.week_no, 'video', idx)}
                      className={`flex items-center text-sm w-full py-2 px-3 rounded-md ${
                        selectedContent?.weekNo === week.week_no && 
                        selectedContent?.type === 'video' && 
                        selectedContent?.index === idx
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{video.title}</span>
                    </button>
                  ))}
                  
                  {weekContents[week.week_no]?.practice_assignments.map((assignment, idx) => (
                    <button
                      key={`practice-${idx}`}
                      onClick={() => handleSelectContent(week.week_no, 'practice', idx)}
                      className={`flex items-center text-sm w-full py-2 px-3 rounded-md ${
                        selectedContent?.weekNo === week.week_no && 
                        selectedContent?.type === 'practice' && 
                        selectedContent?.index === idx
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {assignment.title || `Practice Assignment ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                  
                  {weekContents[week.week_no]?.graded_assignments.map((assignment, idx) => (
                    <button
                      key={`graded-${idx}`}
                      onClick={() => handleSelectContent(week.week_no, 'graded', idx)}
                      className={`flex items-center text-sm w-full py-2 px-3 rounded-md ${
                        selectedContent?.weekNo === week.week_no && 
                        selectedContent?.type === 'graded' && 
                        selectedContent?.index === idx
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                      }`}
                    >
                      <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {assignment.title || `Graded Assignment ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {selectedItem ? (
          <>
            {selectedItem.type === 'video' && (
              <VideoViewer
                video={selectedItem.content}
                onClose={() => setSelectedContent(null)}
                isAdmin={isAdmin}
                onUpdate={selectedItem.onUpdate}
              />
            )}
            
            {selectedItem.type === 'assignment' && (
              <AssignmentViewer
                assignment={selectedItem.content}
                type={selectedItem.assignmentType}
                onClose={() => setSelectedContent(null)}
                isAdmin={isAdmin}
                onUpdate={selectedItem.onUpdate}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 text-purple-600">
              <BookOpen className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Select a course item
            </h3>
            <p className="text-gray-600 max-w-md">
              Choose a video or assignment from the sidebar to start learning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}