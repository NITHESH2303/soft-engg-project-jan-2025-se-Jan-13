import Icon from "react-icons-kit";
import { Assignment } from "./WeeklyContentUpload";
import { minus } from 'react-icons-kit/feather/minus';
// AssignmentItem component - shared between practice and graded assignments
interface AssignmentItemProps {
    index: number;
    assignment: Assignment;
    assignments: Assignment[];
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
    type: 'Practice' | 'Graded';
  }
  
export function AssignmentItem({ 
    index, 
    assignment, 
    assignments, 
    setAssignments,
    type
  }: AssignmentItemProps) {
    
    const updateField = (field: keyof Assignment, value: any) => {
      const updatedAssignments = [...assignments];
      updatedAssignments[index] = {
        ...updatedAssignments[index],
        [field]: value
      };
      setAssignments(updatedAssignments);
    };
  
    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-4">
        <div className="flex justify-between">
          <h4 className="font-medium">{type} Assignment {index + 1}</h4>
          <button
            onClick={() => setAssignments(assignments.filter((_, i) => i !== index))}
            className="text-red-500 flex items-center"
          >
            <Icon icon={minus} size={16} /> <span className="ml-1">Remove</span>
          </button>
        </div>
        
        <div className="mt-2">
          <div className="flex items-center mb-2">
            <label className="mr-4">Deadline:</label>
            <input
              type="date"
              value={assignment.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          
          <div className="flex items-center">
            <label className="mr-4">Coding Assignment:</label>
            <input
              type="checkbox"
              checked={assignment.is_coding_assignment}
              onChange={(e) => updateField('is_coding_assignment', e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>
    );
  }