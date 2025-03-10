import React from 'react';
import { Link } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <Link 
      to={`/admin/manage-course/${course.id}`} 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-6">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
          {course.category}
        </span>
        <div className="text-4xl mb-4">{course.icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <span className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center">
          Manage Course
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default CourseCard;
