import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
import { chevronDown } from 'react-icons-kit/feather/chevronDown';
import { chevronUp } from 'react-icons-kit/feather/chevronUp';
import { pieChart } from 'react-icons-kit/feather/pieChart';
import { Link, useParams } from 'react-router-dom';
import Chat from './Chat';

interface Video {
  id: number;
  title: string;
  duration: string;
  video_link: string;
  transcript:string;
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

  const TestTranscript = `So, welcome to this course on Business Data Management or really what the course content
is about you will find out is about managing businesses using data would probably be a
better title for the course.
This course is going to be taught by a number of people.
In fact quite a few people.
The first four weeks is going to cover the business context, which comes mostly from
the world of economics.
So, along with me, my name is Venkatesh.
So along with me, and I am just called GV.
So, you will hear GV being referred to quite a lot and as we go along we have Sureshbabu,
who is a professor of economics at IIT Madras and he will be sharing the load of teaching
the first four weeks or we both will be discussing really concepts from economics, in the first
four weeks.
Subsequent to that, we have a bunch of case studies that I will go through, I will explain
to you what we are going to do, which will be for the remaining you know, for seven weeks,
we have case studies, very interesting case studies from four different domains and to
help me with those case studies, I have Dr. Milind Gandhe, who is at IIIT Bangalore, he
is the head of the machine intelligence and robotics centre there.
He has many years of industrial experience and understands this world also of data very
well.
So, Milind Gandhe and I will be taking the next seven weeks.
So, between myself Suresh babu, and Milind Gandhe we will try and get you a reasonable
coverage of what we want to do in this course.
But the case studies itself we are going to have some guests, who are going to basically
help us with the case study.
So for Flipkart, we have Omkar Karandikar who is going to, who is heading the logistics
division and Flipkart and he is going to basically help us with the kind of a fictitious case
you have created.
But based on data that is, you can see in Flipkart.
So, this is called Fabmart, there is a, that is the case that we have and then we are going
to have a manufacturing case that basically for which we have a person, Sivakumar, whose
got many years of experience in the manufacturing industry and he has been consulting in manufacturing
and so on.
So, he will basically be helping us with the data as well as the discussions of that case.
And then we have Varsha from Mercer, Mercer consulting is a very prominent well known
HR consulting firm.
So, she is going to do help us with a case in HR and finally, we have Venket, who is
going to basically, who is from Pay Pal, who is helping us with the case on payments, Fintech.`

const getTruncatedTranscript = (video, length = 150) => {
  if (!video?.transcript) return "";
  return video.transcript.length > length
    ? video.transcript.substring(0, length) + "..."
    : video.transcript;
};
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
    
        // Dummy response
        const dummyResponse = {
          "course_id": 1,
          "weeks": [
            {
              "week_no": 1,
              "term": "Spring 2025",
              "upload_date": "2025-02-01",
              "videos": [
                {
                  "id": 1,
                  "course_id": 1,
                  "week_no": 1,
                  "title": "What is Data Management?",
                  "transcript": TestTranscript,
                  "duration": "10:30",
                  "video_link": "https://youtu.be/S0cP7uE_iLc?si=IvjSGotFfBYk0Ndk",
                  "created_at": "2025-02-17T11:12:27.462526Z",
                  "modified_at": null
                },
                {
                  "id": 2,
                  "course_id": 1,
                  "week_no": 1,
                  "title": "Types of Business Data",
                  "transcript": "In this video, we explore various types of business data...",
                  "duration": "15:45",
                  "video_link": "https://example.com/video2",
                  "created_at": "2025-02-17T11:12:27.462526Z",
                  "modified_at": null
                },
                {
                  "id": 3,
                  "course_id": 1,
                  "week_no": 1,
                  "title": "Data Collection Methods",
                  "transcript": "Learn about different methods of collecting business data...",
                  "duration": "12:20",
                  "video_link": "https://example.com/video3",
                  "created_at": "2025-02-17T11:12:27.462526Z",
                  "modified_at": null
                }
              ],
              "practice_assignments": [
                {
                  "id": 1,
                  "course_id": 1,
                  "week_no": 1,
                  "lecture_id": 1,
                  "assignment_content": [
                    {
                      "question": "List five types of business data.",
                      "type": "short_answer"
                    },
                    {
                      "question": "What are the advantages of digital data storage?",
                      "type": "multiple_choice"
                    }
                  ],
                  "is_coding_assignment": false,
                  "deadline": "2025-02-10",
                  "created_at": "2025-02-17T11:12:27.765232Z",
                  "modified_at": null
                }
              ],
              "graded_assignments": [
                {
                  "id": 1,
                  "course_id": 1,
                  "week_no": 1,
                  "assignment_content": [
                    {
                      "question": "What is the primary purpose of data management?",
                      "type": "multiple_choice"
                    },
                    {
                      "question": "Describe three methods of data collection.",
                      "type": "essay"
                    }
                  ],
                  "is_coding_assignment": false,
                  "deadline": "2025-02-15",
                  "created_at": "2025-02-17T11:12:27.598914Z",
                  "modified_at": null
                }
              ]
            }
          ]
        };
    
        setCourseContent(dummyResponse);
        if (dummyResponse.weeks.length > 0 && dummyResponse.weeks[0].videos.length > 0) {
          setSelectedContent({ type: 'video', id: dummyResponse.weeks[0].videos[0].id });
        }
      } catch (error) {
        console.error('Error fetching course content:', error);
      }
    };
    

    fetchCourseContent();
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
        return (
          <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
          <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg mb-6">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/S0cP7uE_iLc?si=EFJ3CdRPncPJIzHp"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{video.title}</h2>
          <p className="text-gray-600 mt-2">Duration: {video.duration}</p>
    
          {/* Transcript Section */}
          <p className="text-gray-600 mt-2">
            {showFullTranscript ? video.transcript : getTruncatedTranscript(video)}
          </p>
    
          {/* Toggle Button */}
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
        return (
          <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedContent.type === 'practice' ? 'Practice Assignment' : 'Graded Assignment'}
            </h2>
            <p className="text-gray-600 mt-2">Deadline: {assignment.deadline}</p>
            <p className="text-gray-600">
              {assignment.is_coding_assignment ? 'Coding Assignment' : 'Written Assignment'}
            </p>
            {/* Render assignment content here */}
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
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon icon={x} size={20} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
}
