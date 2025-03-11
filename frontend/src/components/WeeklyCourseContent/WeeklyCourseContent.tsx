// Main Component - WeeklyCourseContent.tsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AssignmentViewer from './AssignmentViewer';
import ContentList from './ContentList';
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
  course_id: number;
  week_no: number;
  video_lectures: Video[];
  practice_assignments: Assignment[];
  graded_assignments: Assignment[];
}

interface WeeklyCourseContentProps {
  courseId: number;
  weekNo: number;
  role: 'admin' | 'student';
}

export default function WeeklyCourseContent({ 
  courseId, 
  weekNo, 
  role 
}: WeeklyCourseContentProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ type: string; index: number } | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = role === 'admin';
  
  useEffect(() => {
    if (expanded && !weekContent) {
      fetchWeekContent();
    }
  }, [expanded, courseId, weekNo]);

  useEffect(() => {
    if (!expanded) {
      setSelectedContent(null);
    }
  }, [expanded]);

  const fetchWeekContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fixed endpoints - using courseId and weekNo props instead of hardcoded values
      const endpoint = isAdmin 
        ? `http://127.0.0.1:8000/api/admin/weekwise-content/${courseId}/${weekNo}`
        : `http://127.0.0.1:8000/api/admin/weekwise-content/${1}/${3}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const data = await response.json();
      console.log("This is the weekly content from backend",data);
      
      setWeekContent({
        ...data,
        video_lectures: data.video_lectures || [],
        practice_assignments: data.practice_assignments || [],
        graded_assignments: data.graded_assignments || []
      });
    } catch (error) {
      setError('Failed to fetch week content');
      console.error('Error fetching week content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentUpdate = async (updatedContent: WeekContent) => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/weekwise-content/${courseId}/${weekNo}`,
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
      setWeekContent(updatedContent);
    } catch (error) {
      setError('Failed to update content');
      console.error('Error updating content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 lg:flex lg:flex-col lg:h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <button
          className="w-full px-6 py-5 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
              {weekNo}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Week {weekNo}: Learning Module</h3>
              {/* Removed term and upload_date as they're not in the backend response */}
            </div>
          </div>
          <div className="flex items-center">
            {expanded && weekContent && (
              <span className="text-xs font-medium mr-3 px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                {weekContent.video_lectures.length} videos · 
                {weekContent.practice_assignments.length + weekContent.graded_assignments.length} assignments
              </span>
            )}
            {expanded ? (
              <ChevronUp size={24} className="text-indigo-500" />
            ) : (
              <ChevronDown size={24} className="text-indigo-500" />
            )}
          </div>
        </button>
        
        {expanded && (
          <div className={`${selectedContent ? 'lg:flex' : ''}`}>
            <div className={`px-6 py-4 border-t border-gray-100 ${selectedContent ? 'lg:w-1/3 lg:border-r' : 'w-full'}`}>
              {loading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              
              {weekContent && (
                <ContentList 
                  weekContent={weekContent}
                  selectedContent={selectedContent}
                  setSelectedContent={setSelectedContent}
                  role={role}
                  onContentUpdate={isAdmin ? handleContentUpdate : undefined}
                />
              )}
            </div>
            
            {selectedContent && weekContent && (
              <div className="px-6 py-4 border-t border-gray-100 lg:w-2/3">
                {selectedContent.type === 'video' && (
                  <VideoViewer
                    video={weekContent.video_lectures[selectedContent.index]}
                    onClose={() => setSelectedContent(null)}
                    isAdmin={isAdmin}
                    onUpdate={(updatedVideo) => {
                      if (isAdmin && weekContent) {
                        const updatedContent = {
                          ...weekContent,
                          video_lectures: weekContent.video_lectures.map((v, i) => 
                            i === selectedContent.index ? updatedVideo : v
                          )
                        };
                        handleContentUpdate(updatedContent);
                      }
                    }}
                  />
                )}
                
                {(selectedContent.type === 'practice' || selectedContent.type === 'graded') && (
                  <AssignmentViewer
                    assignment={
                      selectedContent.type === 'practice'
                        ? weekContent.practice_assignments[selectedContent.index]
                        : weekContent.graded_assignments[selectedContent.index]
                    }
                    type={selectedContent.type}
                    onClose={() => setSelectedContent(null)}
                    isAdmin={isAdmin}
                    onUpdate={(updatedAssignment) => {
                      if (isAdmin && weekContent) {
                        const assignmentType = selectedContent.type === 'practice' 
                          ? 'practice_assignments' 
                          : 'graded_assignments';
                        const updatedContent = {
                          ...weekContent,
                          [assignmentType]: weekContent[assignmentType].map((a, i) => 
                            i === selectedContent.index ? updatedAssignment : a
                          )
                        };
                        handleContentUpdate(updatedContent);
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}