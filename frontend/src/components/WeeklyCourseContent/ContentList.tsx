// ContentList.tsx
import { Play, Book, Award, Plus } from 'lucide-react';
import { WeekContent } from './WeeklyCourseContent';
import { useState } from 'react';
import AddContentModal from './AddContent';

interface ContentListProps {
  weekContent: WeekContent;
  selectedContent: { type: string; index: number } | null;
  setSelectedContent: (content: { type: string; index: number } | null) => void;
  role: 'admin' | 'student';
  onContentUpdate?: (content: WeekContent) => void;
}

export default function ContentList({
  weekContent,
  selectedContent,
  setSelectedContent,
  role,
  onContentUpdate
}: ContentListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addContentType, setAddContentType] = useState<'video' | 'practice' | 'graded'>('video');
  const isAdmin = role === 'admin';

  const handleAddContent = (type: 'video' | 'practice' | 'graded') => {
    setAddContentType(type);
    setShowAddModal(true);
  };

  const handleAddNewContent = (newContent: any) => {
    if (!onContentUpdate) return;
    
    const updatedContent = { ...weekContent };
    
    if (addContentType === 'video') {
      updatedContent.video_lectures = [...updatedContent.video_lectures, { 
        ...newContent,
        course_id: weekContent.course_id,
        week_no: weekContent.week_no
      }];
    } else if (addContentType === 'practice') {
      updatedContent.practice_assignments = [...updatedContent.practice_assignments, { 
        ...newContent,
        course_id: weekContent.course_id,
        week_no: weekContent.week_no
      }];
    } else if (addContentType === 'graded') {
      updatedContent.graded_assignments = [...updatedContent.graded_assignments, { 
        ...newContent,
        course_id: weekContent.course_id,
        week_no: weekContent.week_no
      }];
    }
    
    onContentUpdate(updatedContent);
    setShowAddModal(false);
  };

  // If content is selected, don't show the list on mobile view
  if (selectedContent && window.innerWidth < 1024) {
    return null;
  }

  return (
    <div className="py-2">
      {/* Videos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Video Lectures</h4>
          {isAdmin && (
            <button 
              onClick={() => handleAddContent('video')}
              className="p-1 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {weekContent.video_lectures.length > 0 ? (
          <div className="space-y-2">
            {weekContent.video_lectures.map((video, index) => (
              <button
                key={index}
                className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors border ${
                  selectedContent && selectedContent.type === 'video' && selectedContent.index === index
                    ? 'bg-indigo-100 border-indigo-300'
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                } group`}
                onClick={() => setSelectedContent({ type: 'video', index })}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 group-hover:bg-indigo-200">
                    <Play size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{video.title}</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">{video.duration}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No videos available</p>
        )}
      </div>
      
      {/* Practice Assignments */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Practice Assignments</h4>
          {isAdmin && (
            <button 
              onClick={() => handleAddContent('practice')}
              className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {weekContent.practice_assignments.length > 0 ? (
          <div className="space-y-2">
            {weekContent.practice_assignments.map((pa, index) => (
              <button
                key={index}
                className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors border ${
                  selectedContent && selectedContent.type === 'practice' && selectedContent.index === index
                    ? 'bg-blue-100 border-blue-300'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                } group`}
                onClick={() => setSelectedContent({ type: 'practice', index })}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 group-hover:bg-blue-200">
                    <Book size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                    {pa.title} {pa.is_coding_assignment ? '(Coding)' : '(Written)'}
                  </span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">
                  Due: {new Date(pa.deadline).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No practice assignments available</p>
        )}
      </div>

      {/* Graded Assignments */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Graded Assignments</h4>
          {isAdmin && (
            <button 
              onClick={() => handleAddContent('graded')}
              className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {weekContent.graded_assignments.length > 0 ? (
          <div className="space-y-2">
            {weekContent.graded_assignments.map((ga, index) => (
              <button
                key={index}
                className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors border ${
                  selectedContent && selectedContent.type === 'graded' && selectedContent.index === index
                    ? 'bg-green-100 border-green-300'
                    : 'border-gray-100 hover:border-green-200 hover:bg-green-50'
                } group`}
                onClick={() => setSelectedContent({ type: 'graded', index })}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 group-hover:bg-green-200">
                    <Award size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-green-700">
                    {ga.title} {ga.is_coding_assignment ? '(Coding)' : '(Written)'}
                  </span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200">
                  Due: {new Date(ga.deadline).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No graded assignments available</p>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal
          contentType={addContentType}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddNewContent}
        />
      )}
    </div>
  );
}