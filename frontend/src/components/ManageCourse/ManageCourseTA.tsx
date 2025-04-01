import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Users, Settings, Layers, X, Upload, Eye } from 'lucide-react';
import WeeklyCourseContent from '../WeeklyCourseContent/WeeklyCourseContent';
import WeeklyContentUpload from '../Admin/WeeklyContentUploader/WeeklyContentUpload';

export default function ManageCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [newWeekData, setNewWeekData] = useState({
    weekNo: 0,
    term: 'Spring 2025'
  });
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Toggle between view and upload modes
  const [activeView, setActiveView] = useState<'view' | 'upload'>('view');

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsAddWeekModalOpen(false);
      }
    }

    if (isAddWeekModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddWeekModalOpen]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/admin/dashboard" className="flex items-center text-gray-700 hover:text-purple-600">
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <Link to="/admin/students" className="flex items-center text-gray-700 hover:text-purple-600">
                <Users className="w-5 h-5 mr-2" />
                Students
              </Link>
              <Link to="/admin/dashboard" className="flex items-center text-gray-700 hover:text-purple-600">
                <Layers className="w-5 h-5 mr-2" />
                Courses
              </Link>
              <Link to="/admin/settings" className="flex items-center text-gray-700 hover:text-purple-600">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Toggle between view and upload modes */}
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  className={`flex items-center px-3 py-1 rounded-md ${
                    activeView === 'view' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  onClick={() => setActiveView('view')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Content
                </button>
                <button
                  className={`flex items-center px-3 py-1 rounded-md ${
                    activeView === 'upload' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                  onClick={() => setActiveView('upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {activeView === 'view' ? (
          <WeeklyCourseContent 
            courseId={parseInt(courseId || '0')} 
            role="admin"
            onProgressUpdate={(completed) => {
              console.log('Content updated:', completed);
            }}
          />
        ) : (
          <WeeklyContentUpload />
        )}
      </div>

      {/* Simple Modal */}
      {isAddWeekModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Week</h3>
              <button 
                onClick={() => setIsAddWeekModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="weekNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number
                </label>
                <input
                  id="weekNo"
                  type="number"
                  value={newWeekData.weekNo || ''}
                  onChange={(e) => setNewWeekData({ ...newWeekData, weekNo: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                  Term
                </label>
                <input
                  id="term"
                  value={newWeekData.term}
                  onChange={(e) => setNewWeekData({ ...newWeekData, term: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 mt-1">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}