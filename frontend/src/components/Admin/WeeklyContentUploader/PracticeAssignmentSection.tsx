import React from 'react';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { AssignmentContentEditor } from '../QuestionEditors/QuestionEditor';


// Enhanced Assignment interface
export interface EnhancedAssignment {
  title?: string;
  deadline: string;
  is_coding_assignment: boolean;
  description?: string;
  assignment_content: Array<{
    id: number;
    question: string;
    type: 'mcq' | 'msq' | 'number' | 'text';
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    points: number;
    answer?: string | string[] | number;
    format?: string;
    hint?: string;
    comment?: string;
  }>;
}

// Practice Assignment Section
interface PracticeAssignmentSectionProps {
  practiceAssignments: EnhancedAssignment[];
  setPracticeAssignments: React.Dispatch<React.SetStateAction<EnhancedAssignment[]>>;
}

export default function PracticeAssignmentSection({ 
  practiceAssignments, 
  setPracticeAssignments 
}: PracticeAssignmentSectionProps) {
  
  const handleAddPracticeAssignment = () => {
    setPracticeAssignments([
      ...practiceAssignments,
      {
        title: '',
        deadline: '',
        is_coding_assignment: false,
        description: '',
        assignment_content: [],
      },
    ]);
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Practice Assignments</h3>
        <button
          onClick={handleAddPracticeAssignment}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <Icon icon={plus} size={16} /> <span className="ml-1">Add Assignment</span>
        </button>
      </div>
      
      {practiceAssignments.map((assignment, index) => (
        <AssignmentContentEditor
          key={index}
          index={index}
          assignment={assignment}
          assignments={practiceAssignments}
          setAssignments={setPracticeAssignments}
          type="Practice"
        />
      ))}
      
      {practiceAssignments.length === 0 && (
        <p className="text-gray-500 italic text-center py-8">No practice assignments added yet.</p>
      )}
    </div>
  );
}

