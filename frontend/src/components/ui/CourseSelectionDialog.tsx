import React, { useState } from 'react';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface CourseSelectionDialogProps {
  availableCourses: Course[];
  onConfirm: (selectedCourses: number[]) => void;
  onCancel: () => void;
}

const CourseSelectionDialog: React.FC<CourseSelectionDialogProps> = ({ availableCourses, onConfirm, onCancel }) => {
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const toggleCourse = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-purple-800">Select Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 p-4">
          {availableCourses.map(course => (
            <div key={course.id} className={`bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md 
              ${selectedCourses.includes(course.id) ? 'ring-2 ring-purple-500 shadow-lg' : ''} overflow-hidden`}
              onClick={() => toggleCourse(course.id)}>
              <div className="text-4xl mb-2">{course.icon}</div>
              <h3 className="font-bold text-lg text-purple-900">{course.title}</h3>
              <p className="text-sm text-purple-600 mb-2">{course.category}</p>
              <p className="text-sm text-gray-600">{course.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-semibold">
            Selected: <span className="text-purple-600">{selectedCourses.length}</span> / {availableCourses.length}
          </p>
          <div>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2 hover:bg-gray-300 transition-colors duration-300"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
              onClick={() => onConfirm(selectedCourses)}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionDialog;
