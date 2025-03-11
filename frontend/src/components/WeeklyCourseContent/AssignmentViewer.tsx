// AssignmentViewer.tsx
import { Assignment } from './WeeklyCourseContent';
import { Calendar, Book, Code, Award, X, Edit, Save } from 'lucide-react';
import { useState } from 'react';
import CourseAssignment from '../pages/CourseAssignment';

interface AssignmentViewerProps {
  assignment: Assignment;
  type: string;
  onClose: () => void;
  isAdmin: boolean;
  onUpdate?: (updatedAssignment: Assignment) => void;
}

export default function AssignmentViewer({ 
  assignment, 
  type, 
  onClose, 
  isAdmin, 
  onUpdate 
}: AssignmentViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssignment, setEditedAssignment] = useState<Assignment>(assignment);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedAssignment);
    }
    setIsEditing(false);
  };

  const isGraded = type === 'graded';
  const colorClasses = isGraded 
    ? 'bg-green-50 text-green-700' 
    : 'bg-blue-50 text-blue-700';
  const title = isGraded ? 'Graded Assignment' : 'Practice Assignment';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-800">{title}</h2>
        <div className="flex gap-2">
          {isAdmin && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className={`text-${isGraded ? 'green' : 'blue'}-500 hover:text-${isGraded ? 'green' : 'blue'}-700 transition-colors`}
            >
              <Edit size={20} />
            </button>
          )}
          {isEditing && (
            <button 
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 transition-colors"
            >
              <Save size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <div className={`flex items-center px-3 py-1 ${colorClasses} rounded-full`}>
          <Calendar size={16} className="mr-2" />
          {isEditing ? (
            <input
              type="text"
              value={editedAssignment.deadline}
              onChange={(e) => setEditedAssignment({ ...editedAssignment, deadline: e.target.value })}
              className={`text-sm font-medium bg-transparent border-b border-${isGraded ? 'green' : 'blue'}-300 focus:outline-none focus:border-${isGraded ? 'green' : 'blue'}-500`}
            />
          ) : (
            <p className="text-sm font-medium">Due: {assignment.deadline}</p>
          )}
        </div>
        
        <div className={`flex items-center px-3 py-1 ${colorClasses} rounded-full`}>
          {assignment.is_coding_assignment ? (
            <Code size={16} className="mr-2" />
          ) : (
            <Book size={16} className="mr-2" />
          )}
          {isEditing ? (
            <select
              value={editedAssignment.is_coding_assignment ? 'coding' : 'written'}
              onChange={(e) => setEditedAssignment({ 
                ...editedAssignment, 
                is_coding_assignment: e.target.value === 'coding' 
              })}
              className={`text-sm font-medium bg-transparent border-b border-${isGraded ? 'green' : 'blue'}-300 focus:outline-none focus:border-${isGraded ? 'green' : 'blue'}-500`}
            >
              <option value="coding">Coding Assignment</option>
              <option value="written">Written Assignment</option>
            </select>
          ) : (
            <p className="text-sm font-medium">
              {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <CourseAssignment 
          assignment={assignment} 
          isEditing={isEditing}
          onUpdate={(content) => {
            if (isEditing) {
              setEditedAssignment({
                ...editedAssignment,
                assignment_content: content
              });
            }
          }}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

