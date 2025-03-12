import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Activity, MessageCircle } from 'lucide-react';
import WeeklyCourseContent from '../WeeklyCourseContent/WeeklyCourseContent';
import ChatOverlay from '../ui/ChatOverlay';

export default function StudentCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/student/dashboard" className="flex items-center text-gray-700 hover:text-purple-600">
                <Home className="w-5 h-5 mr-2" />
                Home
              </Link>
              <Link to="/student/performance" className="flex items-center text-gray-700 hover:text-purple-600">
                <Activity className="w-5 h-5 mr-2" />
                Performance
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center text-gray-700 hover:text-purple-600"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <WeeklyCourseContent 
          courseId={parseInt(courseId || '0')} 
          role="student"
          onProgressUpdate={(completed) => {
            // You can handle progress updates here, maybe store in local storage or send to server
            console.log('Progress updated:', completed);
          }}
        />
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}