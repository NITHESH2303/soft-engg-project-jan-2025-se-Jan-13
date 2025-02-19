import React from 'react';

interface PerformanceCardProps {
  subject: string;
  assignments: number;
  quizzes: number;
  projects: number;
  index: number;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ subject, assignments, quizzes, projects, index }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow animate-scale-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{subject}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Assignments</span>
          <span className="font-medium text-blue-600">{assignments}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Quizzes</span>
          <span className="font-medium text-red-600">{quizzes}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Projects</span>
          <span className="font-medium text-yellow-600">{projects}%</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
