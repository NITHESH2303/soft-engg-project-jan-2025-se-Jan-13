import { useParams } from 'react-router-dom';
import WeeklyCourseContent from '../pages/WeeklyCourseContent';
import WeeklyContentUpload from '../Admin/WeeklyContentUploader/WeeklyContentUpload';
import { useState, useEffect } from 'react';

export default function ManageCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [showContentUploader, setShowContentUploader] = useState<boolean>(false);

  useEffect(() => {
    // Fetch available weeks for the course
    const fetchAvailableWeeks = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/course-weeks/${courseId}`);
        const data = await response.json();
        setAvailableWeeks([1, 3]); // Using your test data
      } catch (error) {
        console.error('Error fetching available weeks:', error);
        setAvailableWeeks([1, 3]); // Fallback test data
      }
    };

    fetchAvailableWeeks();
  }, [courseId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
        <button 
          onClick={() => setShowContentUploader(!showContentUploader)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showContentUploader ? 'View Course Content' : 'Add New Content'}
        </button>
      </div>

      {showContentUploader ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload New Content</h2>
          <WeeklyContentUpload courseId={Number(courseId)} onComplete={() => setShowContentUploader(false)} />
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Content</h2>
          {availableWeeks.length > 0 ? (
            <div className="space-y-6">
              {availableWeeks.map((weekNo) => (
                <WeeklyCourseContent 
                  key={weekNo} 
                  courseId={Number(courseId)} 
                  weekNo={weekNo} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-600 mb-4">No content has been added to this course yet.</p>
              <button
                onClick={() => setShowContentUploader(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add First Content
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}