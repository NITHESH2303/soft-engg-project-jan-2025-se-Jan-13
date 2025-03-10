import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { chevronDown } from 'react-icons-kit/feather/chevronDown';
import { chevronUp } from 'react-icons-kit/feather/chevronUp';
import { pieChart } from 'react-icons-kit/feather/pieChart';
import { Link, useParams } from 'react-router-dom';
import ChatOverlay from '../ui/ChatOverlay';
import CourseAssignment from './CourseAssignment';
import { fetchCourseContent } from '../../services/students';

interface Video {
  id: number;
  title: string;
  duration: string;
  video_link: string;
  transcript: string;
}

interface Assignment {
  id: number;
  assignment_content: any[];
  is_coding_assignment: boolean;
  deadline: string;
}

interface Week {
  week_no: number;
  term: string;
  upload_date: string;
  videos: Video[];
  practice_assignments: Assignment[];
  graded_assignments: Assignment[];
}

interface CourseContent {
  course_id: number;
  weeks: Week[];
}

export default function WeeklyCourseContent() {
  const { courseId } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [selectedContent, setSelectedContent] = useState<{ type: string; id: number } | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const getTruncatedTranscript = (video, length = 150) => {
    if (!video?.transcript) return "";
    return video.transcript.length > length
      ? video.transcript.substring(0, length) + "..."
      : video.transcript;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetchCourseContent(courseId);
        setCourseContent(response);
        if (response.weeks.length > 0 && response.weeks[0].videos.length > 0) {
          setSelectedContent({ type: 'video', id: response.weeks[0].videos[0].id });
        }
      } catch (error) {
        console.error('Error fetching course content:', error);
      }
    };
    fetchContent();
  }, [courseId]);

  if (!courseContent) {
    return <div>Loading course content...</div>;
  }

  const renderContentPlayer = () => {
    if (!selectedContent) return null;

    const week = courseContent.weeks.find(w => 
      w.videos.some(v => v.id === selectedContent.id) ||
      w.practice_assignments.some(pa => pa.id === selectedContent.id) ||
      w.graded_assignments.some(ga => ga.id === selectedContent.id)
    );

    if (!week) return null;

    switch (selectedContent.type) {
      case 'video':
        const video = week.videos.find(v => v.id === selectedContent.id);
        if (!video) return null;

        // Corrected video link for embedding
        const embedLink = video.video_link.replace("watch?v=", "embed/");
        
        return (
          <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
            <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg mb-6">
              <iframe
                width="560"
                height="315"
                src={embedLink}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{video.title}</h2>
            <p className="text-gray-600 mt-2">Duration: {video.duration}</p>
            <p className="text-gray-600 mt-2">
              {showFullTranscript ? video.transcript : getTruncatedTranscript(video)}
            </p>
            {video.transcript.length > 150 && (
              <button
                className="text-blue-500 mt-2 font-semibold"
                onClick={() => setShowFullTranscript(!showFullTranscript)}
              >
                {showFullTranscript ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        );
      case 'practice':
      case 'graded':
        const assignment = selectedContent.type === 'practice' 
          ? week.practice_assignments.find(pa => pa.id === selectedContent.id)
          : week.graded_assignments.find(ga => ga.id === selectedContent.id);
        if (!assignment) return null;
        console.log(assignment)
        return (
          <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedContent.type === 'practice' ? 'Practice Assignment' : 'Graded Assignment'}
            </h2>
            <p className="text-gray-600 mt-2">Deadline: {assignment.deadline}</p>
            <p className="text-gray-600">
              {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
            </p>
            <CourseAssignment assignment={assignment} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">21f3001255</h2>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/performance" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Performance</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Course Content</h1>
            <p className="text-gray-600 mt-2">Course ID: {courseContent.course_id}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to={`/course/${courseId}/analytics`}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors animate-scale-in"
            >
              <Icon icon={pieChart} size={20} />
              <span>Analytics</span>
            </Link>
            <span className="text-lg font-medium text-gray-600">21f3001255</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {courseContent.weeks.map((week) => (
              <div 
                key={week.week_no} 
                className="bg-white rounded-xl shadow-md overflow-hidden animate-scale-in"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedWeek(expandedWeek === week.week_no ? null : week.week_no)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">Week {week.week_no}</h3>
                  <Icon 
                    icon={expandedWeek === week.week_no ? chevronUp : chevronDown} 
                    size={20}
                    className="text-gray-500"
                  />
                </button>
                
                {expandedWeek === week.week_no && (
                  <div className="px-6 pb-4 space-y-3">
                    {week.videos.map((video) => (
                      <button
                        key={video.id}
                        className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
                          selectedContent?.id === video.id && selectedContent?.type === 'video'
                            ? 'bg-purple-50 text-purple-600' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedContent({ type: 'video', id: video.id })}
                      >
                        <span className="text-sm font-medium">{video.title}</span>
                        <span className="text-sm text-gray-500">{video.duration}</span>
                      </button>
                    ))}
                    
                    {week.practice_assignments.map((pa) => (
                      <button
                        key={pa.id}
                        className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
                          selectedContent?.id === pa.id && selectedContent?.type === 'practice'
                            ? 'bg-blue-50 text-blue-600' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedContent({ type: 'practice', id: pa.id })}
                      >
                        <span className="text-sm font-medium">Practice Assignment</span>
                        <span className="text-sm text-gray-500">Due: {pa.deadline}</span>
                      </button>
                    ))}

                    {week.graded_assignments.map((ga) => (
                      <button
                        key={ga.id}
                        className={`w-full p-3 rounded-lg flex justify-between items-center transition-colors ${
                          selectedContent?.id === ga.id && selectedContent?.type === 'graded'
                            ? 'bg-green-50 text-green-600' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedContent({ type: 'graded', id: ga.id })}
                      >
                        <span className="text-sm font-medium">Graded Assignment</span>
                        <span className="text-sm text-gray-500">Due: {ga.deadline}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Content Player */}
          <div className="lg:col-span-2">
            {renderContentPlayer()}
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
