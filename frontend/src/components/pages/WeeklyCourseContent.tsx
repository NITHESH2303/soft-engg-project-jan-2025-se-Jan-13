import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { chevronDown, chevronUp } from 'react-icons-kit/feather';
import { play } from 'react-icons-kit/feather';
import { book } from 'react-icons-kit/feather';
import { award } from 'react-icons-kit/feather';
import { clock } from 'react-icons-kit/feather';
import { calendar } from 'react-icons-kit/feather';
import CourseAssignment from './CourseAssignment';

interface Video {
  id: number;
  title: string;
  duration: string;
  video_link: string;
  transcript: string;
}

interface Assignment {
  id: number;
  assignment_content: any[];
  is_coding_assignment: boolean;
  deadline: string;
}

interface WeekContent {
  week_no: number;
  term: string;
  upload_date: string;
  videos: Video[];
  practice_assignments: Assignment[];
  graded_assignments: Assignment[];
}

export default function WeeklyCourseContent({ courseId, weekNo }: { courseId: number; weekNo: number }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ type: string; id: number } | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (expanded && !weekContent) {
      const fetchWeekContent = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`http://127.0.0.1:8000:8000/api/admin/weekwise-content/${courseId}/${weekNo}`);
          const data = await response.json();
          setWeekContent(data);
        } catch (error) {
          setError('Failed to fetch week content');
          console.error('Error fetching week content:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWeekContent();
    }
  }, [expanded, courseId, weekNo, weekContent]);

  // Reset selected content when expanding/collapsing
  useEffect(() => {
    if (!expanded) {
      setSelectedContent(null);
    }
  }, [expanded]);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <button
          className="w-full px-6 py-5 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
              {weekNo}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Week {weekNo}: Learning Module</h3>
              {weekContent && (
                <p className="text-sm text-indigo-600">{weekContent.term} · Uploaded on {weekContent.upload_date}</p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {expanded && weekContent && (
              <span className="text-xs font-medium mr-3 px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                {weekContent.videos.length} videos · {weekContent.practice_assignments.length + weekContent.graded_assignments.length} assignments
              </span>
            )}
            <Icon 
              icon={expanded ? chevronUp : chevronDown} 
              size={24}
              className="text-indigo-500"
            />
          </div>
        </button>
        
        {expanded && (
          <div className="px-6 py-4 border-t border-gray-100">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Please try again later or contact support if the issue persists.</p>
              </div>
            )}
            
            {/* Content list section */}
            {weekContent && !selectedContent && (
              <div className="py-2">
                {weekContent.videos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Video Lectures</h4>
                    <div className="space-y-2">
                      {weekContent.videos.map((video) => (
                        <button
                          key={video.id}
                          className="w-full p-3 rounded-lg flex justify-between items-center transition-colors border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 group"
                          onClick={() => setSelectedContent({ type: 'video', id: video.id })}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 group-hover:bg-indigo-200">
                              <Icon icon={play} size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{video.title}</span>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">{video.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {weekContent.practice_assignments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Practice Assignments</h4>
                    <div className="space-y-2">
                      {weekContent.practice_assignments.map((pa) => (
                        <button
                          key={pa.id}
                          className="w-full p-3 rounded-lg flex justify-between items-center transition-colors border border-gray-100 hover:border-blue-200 hover:bg-blue-50 group"
                          onClick={() => setSelectedContent({ type: 'practice', id: pa.id })}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 group-hover:bg-blue-200">
                              <Icon icon={book} size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                              Practice Assignment {pa.is_coding_assignment ? '(Coding)' : '(Written)'}
                            </span>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">Due: {pa.deadline}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {weekContent.graded_assignments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Graded Assignments</h4>
                    <div className="space-y-2">
                      {weekContent.graded_assignments.map((ga) => (
                        <button
                          key={ga.id}
                          className="w-full p-3 rounded-lg flex justify-between items-center transition-colors border border-gray-100 hover:border-green-200 hover:bg-green-50 group"
                          onClick={() => setSelectedContent({ type: 'graded', id: ga.id })}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 group-hover:bg-green-200">
                              <Icon icon={award} size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-800 group-hover:text-green-700">
                              Graded Assignment {ga.is_coding_assignment ? '(Coding)' : '(Written)'}
                            </span>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200">Due: {ga.deadline}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Video content display */}
            {weekContent && selectedContent && selectedContent.type === 'video' && (() => {
              const video = weekContent.videos.find(v => v.id === selectedContent.id);
              if (!video) return null;
              
              return (
                <div className="mt-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-indigo-800">{video.title}</h2>
                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg mb-6 overflow-hidden shadow-md">
                    <iframe
                      width="100%"
                      height="100%"
                      src={video.video_link}
                      title="Video Player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  
                  <div className="flex items-center mb-4 text-indigo-600">
                    <Icon icon={clock} size={16} className="mr-2" />
                    <p className="text-sm font-medium">Duration: {video.duration}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Transcript</h3>
                    <p className="text-gray-700 leading-relaxed">{video.transcript}</p>
                  </div>
                </div>
              );
            })()}
            
            {/* Practice assignment display */}
            {weekContent && selectedContent && selectedContent.type === 'practice' && (() => {
              const assignment = weekContent.practice_assignments.find(pa => pa.id === selectedContent.id);
              if (!assignment) return null;
              
              return (
                <div className="mt-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-indigo-800">Practice Assignment</h2>
                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      <Icon icon={calendar} size={16} className="mr-2" />
                      <p className="text-sm font-medium">Due: {assignment.deadline}</p>
                    </div>
                    
                    <div className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      <Icon icon={assignment.is_coding_assignment ? 'code' : book} size={16} className="mr-2" />
                      <p className="text-sm font-medium">
                        {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <CourseAssignment />
                  </div>
                </div>
              );
            })()}
            
            {/* Graded assignment display */}
            {weekContent && selectedContent && selectedContent.type === 'graded' && (() => {
              const assignment = weekContent.graded_assignments.find(ga => ga.id === selectedContent.id);
              if (!assignment) return null;
              
              return (
                <div className="mt-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-indigo-800">Graded Assignment</h2>
                    <button 
                      onClick={() => setSelectedContent(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      <Icon icon={calendar} size={16} className="mr-2" />
                      <p className="text-sm font-medium">Due: {assignment.deadline}</p>
                    </div>
                    
                    <div className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      <Icon icon={assignment.is_coding_assignment ? 'code' : book} size={16} className="mr-2" />
                      <p className="text-sm font-medium">
                        {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <CourseAssignment />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}