import React, { useState } from 'react';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface CourseManagementProps {
  courses: Course[];
}

const CourseManagement: React.FC<CourseManagementProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [additionalResources, setAdditionalResources] = useState<string>('');
  const [aiBehavior, setAiBehavior] = useState<string>('');

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleUploadResources = () => {
    // Handle resource upload logic here
    console.log('Uploading additional resources:', additionalResources);
  };

  const handleUpdateAiBehavior = () => {
    // Handle AI behavior update logic here
    console.log('Updating AI behavior:', aiBehavior);
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Course Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCourseSelect(course)}
          >
            <div className="p-6">
              <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                {course.category}
              </span>
              <div className="text-4xl mb-4">{course.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                Manage Course
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage {selectedCourse.title}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Additional Resources</label>
              <textarea
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                value={additionalResources}
                onChange={(e) => setAdditionalResources(e.target.value)}
              />
              <button
                onClick={handleUploadResources}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Upload Resources
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customize AI Behavior</label>
              <textarea
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                value={aiBehavior}
                onChange={(e) => setAiBehavior(e.target.value)}
              />
              <button
                onClick={handleUpdateAiBehavior}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Update AI Behavior
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseManagement;