// AddContentModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';

interface AddContentModalProps {
  contentType: 'video' | 'practice' | 'graded';
  onClose: () => void;
  onSave: (content: any) => void;
}

export default function AddContentModal({ 
  contentType, 
  onClose, 
  onSave 
}: AddContentModalProps) {
  // Initialize different content types with appropriate defaults
  const [videoContent, setVideoContent] = useState({
    title: '',
    duration: '00:00',
    video_link: '',
    transcript: ''
  });
  
  const [assignmentContent, setAssignmentContent] = useState({
    is_coding_assignment: false,
    deadline: new Date().toISOString().split('T')[0],
    assignment_content: [
      { type: 'text', content: 'Assignment instructions go here...' }
    ]
  });
  
  const getTitle = () => {
    switch (contentType) {
      case 'video': return 'Add New Video';
      case 'practice': return 'Add Practice Assignment';
      case 'graded': return 'Add Graded Assignment';
    }
  };
  
  const getColorClasses = () => {
    switch (contentType) {
      case 'video': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'practice': return 'bg-blue-600 hover:bg-blue-700';
      case 'graded': return 'bg-green-600 hover:bg-green-700';
    }
  };
  
  const handleSave = () => {
    if (contentType === 'video') {
      onSave(videoContent);
    } else {
      onSave(assignmentContent);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {contentType === 'video' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
              <input
                type="text"
                value={videoContent.title}
                onChange={(e) => setVideoContent({ ...videoContent, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter video title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={videoContent.duration}
                onChange={(e) => setVideoContent({ ...videoContent, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="MM:SS"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Link</label>
              <input
                type="text"
                value={videoContent.video_link}
                onChange={(e) => setVideoContent({ ...videoContent, video_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter YouTube embed URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
              <textarea
                value={videoContent.transcript}
                onChange={(e) => setVideoContent({ ...videoContent, transcript: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={5}
                placeholder="Enter video transcript"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="coding-assignment"
                checked={assignmentContent.is_coding_assignment}
                onChange={(e) => setAssignmentContent({ 
                  ...assignmentContent, 
                  is_coding_assignment: e.target.checked 
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="coding-assignment" className="ml-2 block text-sm text-gray-700">
                This is a coding assignment
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={assignmentContent.deadline}
                onChange={(e) => setAssignmentContent({ 
                  ...assignmentContent, 
                  deadline: e.target.value 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={assignmentContent.assignment_content[0].content}
                onChange={(e) => setAssignmentContent({
                  ...assignmentContent,
                  assignment_content: [
                    { type: 'text', content: e.target.value },
                    ...assignmentContent.assignment_content.slice(1)
                  ]
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={8}
                placeholder="Enter assignment instructions"
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-white rounded-md ${getColorClasses()} transition-colors`}
          >
            Add {contentType === 'video' ? 'Video' : 'Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}